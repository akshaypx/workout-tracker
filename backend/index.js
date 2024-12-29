import e from "express";

const app = e();

app.get("/test", (req, res) => res.send("hello world"));

app.listen(3000, () => console.log(`Server listening at 3000`));
