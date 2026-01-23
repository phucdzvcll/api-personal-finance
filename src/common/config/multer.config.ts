import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { diskStorage } from "multer";
import { FileStorageUtil } from "../utils/file-storage.util";

const UPLOAD_DIR: string = FileStorageUtil.getUploadDirectory();

interface MulterFile {
  originalname: string;
  mimetype: string;
  size: number;
}

export const multerConfig: MulterOptions = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  storage: diskStorage({
     
    destination: (_req: unknown, _file: MulterFile, cb: (error: Error | null, destination: string) => void) => {
      FileStorageUtil.ensureUploadDirectory();
      cb(null, UPLOAD_DIR);
    },
     
    filename: (_req: unknown, file: MulterFile, cb: (error: Error | null, filename: string) => void) => {
      const generatedFilename: string = FileStorageUtil.generateFilename(file.originalname);
      cb(null, generatedFilename);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req: unknown, file: MulterFile, cb: (error: Error | null, acceptFile: boolean) => void) => {
    try {
      FileStorageUtil.validateFile(file);
      cb(null, true);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : "Invalid file";
      cb(new Error(errorMessage), false);
    }
  },
};
