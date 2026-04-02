import re

try:
    with open('style.css', 'r', encoding='utf-8') as f:
        content = f.read()
except:
    with open('style.css', 'r', encoding='latin-1') as f:
        content = f.read()

new_root = """/* Variables Globales & Thèmes */
:root {
  --radius:      14px;
  --shadow:      0 8px 40px rgba(0,0,0,0.6);
  --transition:  all 0.28s cubic-bezier(0.4,0,0.2,1);

  --bg-deep:     #07070e;
  --bg-card:     #11111c;
  --bg-glass:    rgba(255,255,255,0.04);
  --text:        #e8e8f0;
  --text-muted:  #888899;
  --border-alpha: 0.18;
}

[data-theme="light"] {
  --bg-deep:     #f4f4f9;
  --bg-card:     #ffffff;
  --bg-glass:    rgba(0,0,0,0.04);
  --text:        #1d1d2b;
  --text-muted:  #6b6b7f;
  --border-alpha: 0.25;
  --shadow:      0 8px 30px rgba(0,0,0,0.08);
}

:root, [data-ambiance="classic"] {
  --gold:        #c8a84b;
  --gold-light:  #e8c96a;
  --gold-dim:    rgba(200,168,75,0.12);
  --border:      rgba(200,168,75, var(--border-alpha));
  --gold-gradient: linear-gradient(135deg, #e8c96a, #c8a84b);
  --red:         #e05252;
}

[data-ambiance="scifi"] {
  --gold:        #00f3ff;
  --gold-light:  #70ffff;
  --gold-dim:    rgba(0,243,255,0.12);
  --border:      rgba(0,243,255, var(--border-alpha));
  --gold-gradient: linear-gradient(135deg, #bf54ff, #00f3ff);
  --red:         #ff0055;
}

[data-ambiance="romance"] {
  --gold:        #f372a6;
  --gold-light:  #ff9ebd;
  --gold-dim:    rgba(243,114,166,0.12);
  --border:      rgba(243,114,166, var(--border-alpha));
  --gold-gradient: linear-gradient(135deg, #ff9ebd, #e83a75);
  --red:         #d63031;
}

[data-ambiance="western"] {
  --gold:        #d35400;
  --gold-light:  #e67e22;
  --gold-dim:    rgba(211,84,0,0.12);
  --border:      rgba(211,84,0, var(--border-alpha));
  --gold-gradient: linear-gradient(135deg, #e67e22, #c0392b);
  --red:         #c0392b;
}

[data-ambiance="horror"] {
  --gold:        #b71540;
  --gold-light:  #e55039;
  --gold-dim:    rgba(183,21,64,0.12);
  --border:      rgba(183,21,64, var(--border-alpha));
  --gold-gradient: linear-gradient(135deg, #e55039, #b71540);
  --red:         #c23616;
}
"""

content = re.sub(r':root\s*\{[^}]+\}', new_root, content, count=1)

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(content)
