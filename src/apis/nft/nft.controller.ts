import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { NFTService, NFTMetadata } from './nft.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { IPFSService } from './ipfs.service';

class MintNFTDto {
  chainId: string;
  privateKey: string;
  receiverAddress: string;
  tokenId: number;
  metadata: NFTMetadata;
}

class UploadImageDto {
  name: string;
  description: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

@ApiTags('nft')
@Controller('nft')
export class NFTController {
  constructor(
    private nftService: NFTService,
    private ipfsService: IPFSService,
  ) {}

  @Get('chains')
  @ApiOperation({ summary: 'รับรายการ chains ที่รองรับ' })
  @ApiResponse({ status: 200, description: 'รายการ chains ที่รองรับ' })
  getSupportedChains() {
    return this.nftService.getSupportedChains();
  }

  @Post('upload-image')
  @ApiOperation({ summary: 'อัพโหลดรูปภาพและสร้าง metadata สำหรับ NFT' })
  @ApiResponse({
    status: 201,
    description: 'อัพโหลดรูปภาพเรียบร้อย และได้ metadata',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        name: { type: 'string' },
        description: { type: 'string' },
        attributes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              trait_type: { type: 'string' },
              value: {
                oneOf: [{ type: 'string' }, { type: 'number' }],
              },
            },
          },
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadImageDto: UploadImageDto,
  ) {
    const { name, description, attributes } = uploadImageDto;

    // สร้าง metadata ชั่วคราวที่ยังไม่มี URI ของรูปภาพ
    const metadata: NFTMetadata = {
      name,
      description,
      image: '', // จะถูกอัพเดทโดย uploadImageAndUpdateMetadata
      attributes,
    };

    // อัพโหลดรูปภาพและอัพเดท metadata
    const updatedMetadata = await this.nftService.uploadImageAndUpdateMetadata(
      file.buffer,
      metadata,
    );

    // เพิ่ม HTTP URL สำหรับการเข้าถึงรูปภาพ
    return {
      ...updatedMetadata,
      imageHttpUrl: this.ipfsService.getHttpUrl(updatedMetadata.image),
    };
  }

  @Post('mint')
  @ApiOperation({ summary: 'Mint NFT บน chain ที่ระบุ' })
  @ApiResponse({ status: 201, description: 'NFT ถูก mint สำเร็จ' })
  async mintNFT(@Body() mintNFTDto: MintNFTDto) {
    const { chainId, privateKey, receiverAddress, tokenId, metadata } =
      mintNFTDto;

    const result = await this.nftService.mintNFT(
      chainId,
      privateKey,
      receiverAddress,
      tokenId,
      metadata,
    );

    // เพิ่ม HTTP URL สำหรับการเข้าถึง metadata
    return {
      ...result,
      metadataHttpUrl: this.ipfsService.getHttpUrl(result.metadataUri),
    };
  }
}
