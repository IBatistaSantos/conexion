import { Inject, Injectable } from '@nestjs/common';
import { PipelineRepository } from '../repository/pipeline.repository';

type ListAllPipelineServiceParams = {
  companyId: string;
  pipelineId: string;
};
@Injectable()
export class ListDealPipelineService {
  constructor(
    @Inject('PipelineRepository')
    private readonly pipelineRepository: PipelineRepository,
  ) {}

  async execute(params: ListAllPipelineServiceParams): Promise<any> {
    const { pipelineId, companyId } = params;
    const deals = await this.pipelineRepository.findDealByPipelineId({
      pipelineId,
      companyId,
    });

    const dealFormatted = deals.map((deal) => {
      return {
        id: deal.id,
        title: deal.title,
        createdAt: deal.createdAt,
        pipeline: {
          id: deal.stage.pipeline.id,
          name: deal.stage.pipeline.name,
          stage: {
            id: deal.stage.id,
            name: deal.stage.name,
          },
        },
        creator: {
          id: deal.creator.id,
          name: deal.creator.name,
        },
        user: {
          id: deal.user.id,
          name: deal.user.name,
        },
      };
    });

    return dealFormatted;
  }
}
