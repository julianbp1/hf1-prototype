"""Build the prototype from src/: the base prototype plus each layer, in order.

  python3 build.py              -> index.html (the main prototype)
  python3 build.py <experiment> -> dist/exp-<experiment>.html
                                   main + src/exp/<experiment>.css and/or .js on top
"""
import sys
from pathlib import Path

root = Path(__file__).parent
src = root / 'src'
r = lambda p: p.read_text()

CSS_LAYERS = ['act.css', 'ux.css', 'ux2.css', 'polish.css']
JS_LAYERS = ['fb.js', 'act.js', 'ux.js', 'ux2.js', 'ux3.js', 'polish.js', 'router.js']


def build(exp=None):
    s = r(src / 'base.html')
    css = r(src / 'fb.css')
    layer_css = [r(src / n) for n in CSS_LAYERS if (src / n).exists()]
    js = [r(src / n) for n in JS_LAYERS if (src / n).exists()]
    if exp:
        e_css, e_js = src / 'exp' / f'{exp}.css', src / 'exp' / f'{exp}.js'
        if not (e_css.exists() or e_js.exists()):
            sys.exit(f'No experiment layer at src/exp/{exp}.css or .js')
        if e_css.exists():
            layer_css.append(r(e_css))
        if e_js.exists():
            js.insert(-1, r(e_js))  # before router.js, so ?screen= links still work
    css = css.replace('</style>', '\n'.join(layer_css) + '\n</style>', 1)
    head_end = s.index('<body>') + len('<body>')
    body = s[head_end:].rstrip()
    body = body[:-len('</body></html>')]
    body = body.replace('<title>HF1 owner workspace (Copy) (Copy)</title>', '')
    i = body.index('</style>') + len('</style>')
    body = body[:i] + '\n' + css + body[i:]
    j = body.rindex('})();\n</script>')
    body = body[:j] + '\n'.join(js) + '\n' + body[j:]
    title = f'HF1 prototype · {exp}' if exp else 'HF1 prototype'
    head = s[:head_end].replace('<head>', f'<head><title>{title}</title>', 1)
    out = root / ('dist/exp-%s.html' % exp if exp else 'index.html')
    out.parent.mkdir(exist_ok=True)
    out.write_text(head + body + '</body></html>')
    print('Built', out.relative_to(root))


if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else None)
