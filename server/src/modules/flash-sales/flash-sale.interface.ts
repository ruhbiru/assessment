import { IFlashSaleProduct } from "../products/flash-sale-product.interface";

export interface IFlashSale {
  id: string;
  product: IFlashSaleProduct;
  startTime: Date;
  endTime: Date;
}
