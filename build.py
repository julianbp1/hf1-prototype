"""Build index.html from src/: the base prototype plus each layer, in order."""
from pathlib import Path
src = Path(__file__).parent / 'src'
r = lambda n: (src / n).read_text()
s = r('base.html')
css = r('fb.css')
layer_css = '\n'.join(r(n) for n in ['act.css', 'ux.css', 'ux2.css'])
css = css.replace('</style>', layer_css + '\n</style>', 1)
js = '\n'.join(r(n) for n in ['fb.js', 'act.js', 'ux.js', 'ux2.js', 'ux3.js', 'router.js'])
head_end = s.index('<body>') + len('<body>')
body = s[head_end:].rstrip()
body = body[:-len('</body></html>')]
body = body.replace('<title>HF1 owner workspace (Copy) (Copy)</title>', '')
i = body.index('</style>') + len('</style>')
body = body[:i] + '\n' + css + body[i:]
j = body.rindex('})();\n</script>')
body = body[:j] + js + '\n' + body[j:]
head = s[:head_end].replace('<head>', '<head><title>HF1 prototype</title>', 1)
(Path(__file__).parent / 'index.html').write_text(head + body + '</body></html>')
print('Built index.html')
