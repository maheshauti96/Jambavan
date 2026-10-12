import { launch } from "./cdp.mjs";
const p = await launch(9338);
const f = "file://" + encodeURI("/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/.agents/tasks/mocks/mock-1-home-feed.html");
for (const [w, h, m] of [[1280, 800, false], [390, 844, true]]) {
  await p.viewport(w, h, m); await p.goto(f); await p.sleep(500);
  console.log(w, await p.eval(`Math.round(document.querySelector('.task').getBoundingClientRect().top+scrollY)`), await p.eval(`[...document.querySelectorAll('.task')].map(t=>Math.round(t.getBoundingClientRect().height))`));
}
await p.close();
