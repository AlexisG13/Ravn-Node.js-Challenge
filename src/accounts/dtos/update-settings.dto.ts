import { IsBoolean } from 'class-validator';

export class UpdateSettingsDto {
  @IsBoolean()
  showEmail: boolean;

  @IsBoolean()
  showName: boolean;
}
