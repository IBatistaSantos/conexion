import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DetailsPipelineService } from '../../../modules/pipeline/services/details-pipeline.service';

import { UpdateStageDto } from '../dtos/update-stage.dto';
import { StageRepository } from '../repository/stage.repository';

type UpdateStageServiceRequest = {
  companyId: string;
  updateStage: UpdateStageDto;
  stageId: string;
};

@Injectable()
export class UpdateStageService {
  constructor(
    @Inject('StageRepository')
    private readonly stageRepository: StageRepository,
    private readonly detailsPipelineService: DetailsPipelineService,
  ) {}

  async execute(params: UpdateStageServiceRequest) {
    const { stageId, updateStage, companyId } = params;

    const stageAlreadyExists = await this.stageRepository.findById(stageId);

    if (!stageAlreadyExists) {
      throw new NotFoundException(`Stage with id ${stageId} not found`);
    }

    const pipeline = await this.detailsPipelineService.execute({
      pipelineId: stageAlreadyExists.pipelineId,
      companyId,
    });

    if (!pipeline) {
      throw new NotFoundException('Pipeline does not exist');
    }

    return this.stageRepository.update({
      stageId,
      name: updateStage.name,
    });
  }
}
