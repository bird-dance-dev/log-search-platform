import { SetMetadata } from '@nestjs/common';

export const FunctionalRoles = (...roles: string[]) => SetMetadata('functionalRoles', roles);