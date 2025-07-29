import {
  Controller,
  Get,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  Query,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ClaimService } from './claim.service';
import {
  ClaimQueryDto,
  UpdateClaimDto,
  UpdateClaimStatusDto,
} from './dto/update-claim.dto';
import { ClaimStatus, ProcessStatus } from 'src/utils/types';
import { Claim } from './entities/claim.entity';
import { AuditInterceptor } from 'src/audit-log/audit-interceptor.service';
import { AdminGuard } from 'src/utils/guards/admin.guard';
import { GetAuthData } from 'src/utils/decorators/auth.decorator';
import { QueryDto } from 'src/config/dto/query.dto';
import { AuthData } from 'src/utils/auth.strategy';
import { UpdateProviderClaimStatusDto } from './dto/update-provider-claim.dto';

@ApiBearerAuth('JWT')
@ApiTags('Claims')
@UseInterceptors(AuditInterceptor)
@UseGuards(AdminGuard)
@Controller('claims')
export class ClaimController {
  constructor(private readonly claimsService: ClaimService) {}

  @Get('healthcare-provider/:hospitalId/users')
  @ApiOperation({
    summary: 'Retrieve all claims for users under a health provider',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all claims.',
    type: [Claim],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  findAllUserClaim(
    @Param('hospitalId') hospitalId: string,
    @Query() query: QueryDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.claimsService.findAllUserClaim(hospitalId, query, authData);
  }

  @Get('user')
  @ApiOperation({ summary: 'Get a claim by id' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the claim.',
    type: Claim,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Claim not found.' })
  findOneUserClaim(
    @Query() query: ClaimQueryDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.claimsService.findOneUserClaim(query, authData);
  }

  //   @Put('user')
  //   @ApiOperation({ summary: 'Update a claim' })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'The claim has been successfully updated.',
  //     type: Claim,
  //   })
  //   @ApiResponse({ status: 400, description: 'Bad Request.' })
  //   @ApiResponse({ status: 404, description: 'Claim not found.' })
  //   updateUserClaim(
  //     @Query() query: ClaimQueryDto,
  //     @Body() updateClaimDto: UpdateClaimDto,
  //     @GetAuthData() authData: AuthData,
  //   ) {
  //     return this.claimsService.updateUserClaim(updateClaimDto, authData, query);
  //   }

  @Put('user/status')
  @ApiOperation({ summary: 'Update claim status' })
  @ApiResponse({
    status: 200,
    description: 'The claim status has been successfully updated.',
    type: Claim,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Claim not found.' })
  updateClaimStatusForUser(
    @Query() query: ClaimQueryDto,
    @Body() payload: UpdateClaimStatusDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.claimsService.updateClaimStatusForUser(
      query,
      payload,
      authData,
    );
  }

  //   @Delete(':id')
  //   @ApiOperation({ summary: 'Delete a claim' })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'The claim has been successfully deleted.',
  //   })
  //   @ApiResponse({ status: 400, description: 'Bad Request.' })
  //   @ApiResponse({ status: 404, description: 'Claim not found.' })
  //   remove(@Param('id') id: string) {
  //     return this.claimsService.remove(id);
  //   }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get claims by user' })
  @ApiResponse({
    status: 200,
    description: 'Return claims for the specified user.',
    type: [Claim],
  })
  findByUser(
    @Param('userId') userId: string,
    @GetAuthData() authData: AuthData,
  ) {
    return this.claimsService.findByUser(userId, authData);
  }

  @Get('hospital/:hospitalId')
  @ApiOperation({ summary: 'Get claims by hospital' })
  @ApiResponse({
    status: 200,
    description: 'Return claims for the specified hospital.',
    type: [Claim],
  })
  findByHospital(
    @Param('hospitalId') hospitalId: string,
    @GetAuthData() authData: AuthData,
  ) {
    return this.claimsService.findByHospital(hospitalId, authData);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get claims by status' })
  @ApiResponse({
    status: 200,
    description: 'Return claims with the specified status.',
    type: [Claim],
  })
  findByStatus(
    @Param('status') status: ClaimStatus,
    @GetAuthData() authData: AuthData,
  ) {
    return this.claimsService.findByStatus(status, authData);
  }

  @Get('healthcare-provider')
  @ApiOperation({ summary: 'Retrieve all claims for a healthcare provider' })
  @ApiResponse({
    status: 200,
    description:
      'Successfully retrieved all claims for the healthcare provider.',
    type: [Claim],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  findAllProviderClaims(
    @Query() query: QueryDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.claimsService.findAllProviderClaims(query, authData);
  }

  @Get('healthcare-provider/:providerId')
  @ApiOperation({ summary: 'Get a claim by provider ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the claim for the provider.',
    type: Claim,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Claim not found.' })
  findOneProviderClaim(
    @Param('providerId') providerId: string,
    @GetAuthData() authData: AuthData,
  ) {
    return this.claimsService.findOneProviderClaim(providerId, authData);
  }

  @Put('healthcare-provider/:providerId')
  @ApiOperation({ summary: 'Update a claim for a healthcare provider' })
  @ApiResponse({
    status: 200,
    description: 'The claim has been successfully updated for the provider.',
    type: Claim,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Claim not found.' })
  updateProviderClaim(
    @Param('providerId') providerId: string,
    @Body() updateClaimDto: UpdateClaimDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.claimsService.updateProviderClaim(
      providerId,
      updateClaimDto,
      authData,
    );
  }

  @Put('healthcare-provider/:providerId/status')
  @ApiOperation({ summary: 'Update claim status for a healthcare provider' })
  @ApiResponse({
    status: 200,
    description:
      'The claim status has been successfully updated for the provider.',
    type: Claim,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Claim not found.' })
  updateProviderClaimStatus(
    @Param('providerId') providerId: string,
    @Body() payload: UpdateProviderClaimStatusDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.claimsService.updateProviderClaimStatus(
      providerId,
      payload,
      authData,
    );
  }

  @Get('healthcare-provider/:hospitalId/claims')
  @ApiOperation({ summary: 'Get claims for a healthcare provider by hospital' })
  @ApiResponse({
    status: 200,
    description:
      'Successfully retrieved claims for the healthcare provider by hospital.',
    type: [Claim],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  findProviderClaimsByHospital(
    @Param('hospitalId') hospitalId: string,
    @GetAuthData() authData: AuthData,
  ) {
    return this.claimsService.findProviderClaimsByHospital(
      hospitalId,
      authData,
    );
  }

  @Get('healthcare-provider/status/:status')
  @ApiOperation({ summary: 'Get claims for a healthcare provider by status' })
  @ApiResponse({
    status: 200,
    description:
      'Successfully retrieved claims for the healthcare provider by status.',
    type: [Claim],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  findProviderClaimsByStatus(
    @Param('status') status: ProcessStatus,
    @GetAuthData() authData: AuthData,
  ) {
    return this.claimsService.findProviderClaimsByStatus(status, authData);
  }
}
