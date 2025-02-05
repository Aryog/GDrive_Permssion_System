import { Hono } from "hono";
import { authRoute } from "./auth";
import { fileRoute } from "./file";
import { permissionRoute } from "./permission";
import { shareRoute } from "./share";

const app = new Hono();

app.route("/auth", authRoute);
app.route("/files", fileRoute);
app.route("/permissions", permissionRoute);
app.route("/share", shareRoute);

export default app; 