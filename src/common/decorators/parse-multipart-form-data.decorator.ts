import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from "@nestjs/common";

@Injectable()
export class ParseMultipartFormDataPipe implements PipeTransform {
  transform(value: Record<string, unknown>, metadata: ArgumentMetadata): Record<string, unknown> {
    if (!value || metadata.type !== "body") {
      return value;
    }

    const parsed: Record<string, unknown> = { ...value };

    // Parse numeric fields
    if (parsed.amount !== undefined) {
      const amount: number = parseFloat(parsed.amount as string);
      if (isNaN(amount)) {
        throw new BadRequestException("amount must be a valid number");
      }
      parsed.amount = amount;
    }

    if (parsed.categoryId !== undefined) {
      const categoryId: number = parseInt(parsed.categoryId as string, 10);
      if (isNaN(categoryId)) {
        throw new BadRequestException("categoryId must be a valid integer");
      }
      parsed.categoryId = categoryId;
    }

    // Other fields remain as strings or their original types
    return parsed;
  }
}
