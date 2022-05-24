import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/modules/auth/guard/jwt-auth.guard';
import { User } from 'src/modules/user/entities/user.entity';
import { GetUser } from 'src/shared/decorator/get-user.decorator';
import { CreateDealDto } from '../dtos/crete-deal.dto';
import { CreateDealService } from '../services/create-deal.service';

@Controller('api/v1/deals')
export class DealController {
  constructor(private readonly createDealService: CreateDealService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@GetUser() user: User, @Body() createDealDto: CreateDealDto) {
    const userId = user.id;
    const companyId = user.owner ? user.owner.id : user.employees.company.id;

    return this.createDealService.execute({
      title: createDealDto.title,
      stageId: createDealDto.stageId,
      creatorId: userId,
      companyId,
      userId: createDealDto.userId,
    });
  }
}