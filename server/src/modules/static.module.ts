import { join } from "path";

import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../../../client"),
      exclude: ["/api"],
      serveStaticOptions: {
        index: "index.html",
      },
    }),
  ],
})
export class StaticModule {}
