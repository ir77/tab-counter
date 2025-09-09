import { getTabCount } from './common.js';

// タブの数を取得して表示する
getTabCount().then((count) => {
  document.getElementById('tabCount').textContent = count;
});
