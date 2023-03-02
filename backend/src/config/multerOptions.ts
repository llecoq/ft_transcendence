import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import { extname } from "path";
import { v4 as uuidv4 } from 'uuid';

export const multerOptions = {
  limits: {
      fileSize: 2097152, // 2Mo
  },
  fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(null, true);
      } else {
          cb(new BadRequestException(`Unsupported file type ${extname(file.originalname)}`));
      }
  },
  storage: diskStorage({
      destination: './publics/uploads/profileImages/',
      filename: (req: any, file: any, cb: any) => {
          cb(null, `${uuidv4()}${extname(file.originalname)}`);
      },
  }),
};