import { Equals, IsInt, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class FlashSaleOrderRequestDto {
  @IsNotEmpty()
  @IsString()
  customerId!: string;

  @IsNotEmpty()
  @IsUUID()
  productId!: string;

  @IsInt()
  @Equals(1, { message: "Only one product is allowed per customer!" })
  qty!: number;
}
