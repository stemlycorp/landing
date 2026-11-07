import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
// Use the project's existing checker/compiler; do not require Node's TS stripping.
const source = await readFile(new URL('../src/lib/channel-tools/content.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { appIds, apps, kinds, documentFor, pathFor, external, contact } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

const routes = [];
for (const lang of ['en', 'ko']) for (const id of appIds) for (const kind of kinds) {
  routes.push(pathFor(lang, id, kind));
  test(`${lang}/${id}/${kind}: complete, public-safe document and cross-links`, () => {
    const doc = documentFor(id, lang, kind);
    assert.ok(doc.title.includes(apps[id].name));
    assert.ok(doc.summary.length > 40);
    assert.ok(doc.sections.length >= 4);
    for (const section of doc.sections) {
      assert.ok(section.title);
      assert.ok(section.paragraphs.every(p => p.length > 30));
      for (const link of section.links ?? []) assert.match(link.href, /^(https:\/\/|\/(en|ko)\/)/);
    }
    const text = JSON.stringify(doc);
    assert.doesNotMatch(text, /(?:client_secret|refresh_token|access_token)"\s*:/);
    assert.doesNotMatch(text, /(?:\/home\/|\.sqlite3|16828|1197)/);
    if (lang === 'ko') assert.doesNotMatch(text, /[\u2013\u2014]/);
    if (kind === 'privacy') {
      assert.ok(text.includes('Limited Use requirements'));
      assert.ok(text.includes(contact));
      assert.ok(text.includes(external.revoke.href));
      assert.ok(text.includes(external.googlePrivacy.href));
      assert.ok(text.includes(external.fonts.href));
      assert.ok(text.includes(lang === 'ko' ? '수동' : 'manually'));
      assert.ok(text.includes(lang === 'ko' ? '7일' : 'seven days'));
    }
    if (kind === 'terms') assert.ok(text.includes(external.youtube.href));
    if (kind === 'overview') for (const target of ['privacy', 'terms']) assert.ok(text.includes(pathFor(lang,id,target)));
  });
}

test('12 unique localized trailing-slash URLs', () => {
  assert.equal(routes.length,12);assert.equal(new Set(routes).size,12);
  assert.ok(routes.every(p=>p.endsWith('/')));
});
test('Piston is not described as a working Analytics integration',()=> {
  assert.equal(apps['piston-atlas-publishing'].analytics,false);
  assert.match(documentFor('piston-atlas-publishing','en','overview').sections[2].paragraphs[0],/does not currently collect YouTube Analytics/);
});
test('YAG consolidated authentication is not falsely presented as implemented',()=> {
  assert.match(documentFor('yag-channel-tools','en','overview').sections[2].paragraphs[0],/consolidated authentication is in preparation/);
});
