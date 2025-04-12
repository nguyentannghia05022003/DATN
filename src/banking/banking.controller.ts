import { Controller, Get, Query } from '@nestjs/common';
import { BankingService, Transaction } from './banking.service';

@Controller('banking')
export class BankingController {
    constructor(private readonly bankingService: BankingService) { }

    @Get('transactions')
    async getTransactionList(
        @Query('current') current: string,
        @Query('pageSize') pageSize: string,
    ): Promise<Transaction[]> {
        return this.bankingService.getTransactionList(+current, +pageSize);
    }

    @Get('transactions/count')
    async getTotalTransactions(): Promise<number> {
        return this.bankingService.getTotalTransactions();
    }

    @Get('transactions/details')
    async getTransactionDetail(@Query('id') id: string): Promise<Transaction> {
        return this.bankingService.getTransactionDetail(id);
    }
}