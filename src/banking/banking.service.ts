import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface Transaction {
    id: string;
    transactionDate: string;
    amountIn: number;
    amountOut: number;
    content: string;
    accountNumber?: string;
    referenceCode?: string;
    status?: string;
}

@Injectable()
export class BankingService {
    private readonly token: string;
    private readonly baseUrl = 'https://my.sepay.vn/userapi/transactions';
    private readonly logger = new Logger(BankingService.name);
    private allTransactions: Transaction[] = []; // Cache all transactions if API doesn't support pagination

    constructor(private configService: ConfigService) {
        this.token = this.configService.get<string>('SEPAY_TOKEN');
        if (!this.token) {
            throw new Error('SEPAY_TOKEN is not defined in environment variables.');
        }
    }

    private mapToTransaction(data: any): Transaction {
        const transactionData = data.transaction || data;

        return {
            id: transactionData.id || '',
            transactionDate: transactionData.transaction_date || '',
            amountIn: Number(transactionData.amount_in || 0),
            amountOut: Number(transactionData.amount_out || 0),
            content: transactionData.transaction_content || '',
            accountNumber: transactionData.account_number || '',
            referenceCode: transactionData.reference_number || '',
            status: transactionData.code || '',
        };
    }

    async getTransactionList(current: number, pageSize: number): Promise<Transaction[]> {
        this.logger.log(`Fetching transaction list: current=${current}, pageSize=${pageSize}`);
        try {
            // Attempt to fetch paginated data from SePay API
            const response = await axios.get(`${this.baseUrl}/list`, {
                params: { current, pageSize }, // Use "current" and "pageSize" to match frontend
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
            });

            //this.logger.debug('Response from SePay /list:', response.data);

            let transactions = Array.isArray(response.data)
                ? response.data
                : response.data.transactions || [];

            // If the API doesn't paginate (returns same data for all pages), fetch all and paginate manually
            if (current === 1) {
                this.allTransactions = transactions.map((item) => this.mapToTransaction(item));
            }

            // Check if pagination is working by comparing data
            if (current > 1 && this.allTransactions.length > 0) {
                const startIndex = (current - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                transactions = this.allTransactions.slice(startIndex, endIndex);
            } else {
                transactions = transactions.map((item) => this.mapToTransaction(item));
            }

            return transactions;
        } catch (error) {
            this.logger.error('Error fetching transaction list:', error.message);
            if (error.response?.status === 401) {
                throw new UnauthorizedException('Token SePay không hợp lệ hoặc đã hết hạn.');
            }
            throw new BadRequestException(
                error.response?.data?.message || 'Không thể lấy danh sách giao dịch.',
            );
        }
    }

    async getTotalTransactions(): Promise<number> {
        this.logger.log('Fetching total transactions');
        try {
            const response = await axios.get(`${this.baseUrl}/count`, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
            });

            //this.logger.debug('Response from SePay /count:', response.data);

            return response.data.count_transactions || 0;
        } catch (error) {
            this.logger.error('Error fetching total transactions:', error.message);
            if (error.response?.status === 401) {
                throw new UnauthorizedException('Token SePay không hợp lệ hoặc đã hết hạn.');
            }
            throw new BadRequestException(
                error.response?.data?.message || 'Không thể lấy tổng số giao dịch.',
            );
        }
    }

    async getTransactionDetail(transactionId: string): Promise<Transaction> {
        this.logger.log(`Fetching transaction detail: transactionId=${transactionId}`);
        try {
            const response = await axios.get(`${this.baseUrl}/details/${transactionId}`, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
            });

            //this.logger.debug('Response from SePay /details:', response.data);

            return this.mapToTransaction(response.data);
        } catch (error) {
            this.logger.error('Error fetching transaction detail:', error.message);
            if (error.response?.status === 401) {
                throw new UnauthorizedException('Token SePay không hợp lệ hoặc đã hết hạn.');
            }
            if (error.response?.status === 404) {
                throw new BadRequestException('Không tìm thấy giao dịch với ID này.');
            }
            throw new BadRequestException(
                error.response?.data?.message || 'Không thể lấy chi tiết giao dịch.',
            );
        }
    }
}