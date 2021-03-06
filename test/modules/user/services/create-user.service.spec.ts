import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../../../src/modules/user/repository';
import { CreateUserService } from '../../../../src/modules/user/services/create-user.service';
import { Encryption } from '../../../../src/shared/providers/encryption/contracts/encryption';

import { MockProxy, mock } from 'jest-mock-extended';
import { BadRequestException } from '@nestjs/common';

jest.useFakeTimers().setSystemTime(new Date(2020, 1, 1));

describe('CreateUserService', () => {
  let service: CreateUserService;

  let userRepository: MockProxy<UserRepository>;
  let encryption: MockProxy<Encryption>;

  const user = {
    id: 'userId',
    email: 'email',
    name: 'name',
    password: 'password',
  };

  beforeAll(() => {
    userRepository = mock();
    encryption = mock();

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(user);

    encryption.hash.mockResolvedValue('passwordHash');
    encryption.compare.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserService,
        { provide: 'EncryptionProvider', useValue: encryption },
        { provide: 'UserRepository', useValue: userRepository },
      ],
    }).compile();

    service = module.get<CreateUserService>(CreateUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw an error if user already exists', async () => {
    userRepository.findByEmail.mockResolvedValueOnce({
      id: 'id',
      email: 'email',
      name: 'name',
      password: '',
    });
    const promise = service.execute({
      email: 'any_email',
      name: 'any_name',
      password: 'any_password',
    });

    await expect(promise).rejects.toThrow(
      new BadRequestException(`User with email any_email already exists`),
    );
  });

  it('should call FindByEmail with correct parameters', async () => {
    await service.execute({
      email: 'any_email',
      name: 'any_name',
      password: 'any_password',
    });

    expect(userRepository.findByEmail).toBeCalledWith('any_email');
    expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
  });

  it('should call Create with correct parameters', async () => {
    await service.execute({
      email: 'any_email',
      name: 'any_name',
      password: 'any_password',
    });

    expect(userRepository.create).toBeCalledWith({
      email: 'any_email',
      name: 'any_name',
      password: 'passwordHash',
    });
  });

  it('should returns an user on success', async () => {
    const result = await service.execute({
      email: 'any_email',
      name: 'any_name',
      password: 'any_password',
    });

    expect(result).toEqual(user);
  });
});
