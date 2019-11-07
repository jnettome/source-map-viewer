import './components/Viewer.js';
import './components/Console.js';
import './components/Controls.js';
import '@uncut/gyro-layout/components/layout/Layout.js';
import layoutStyles from '@uncut/gyro-layout/components/layout/Layout.css';

const layoutStyle = document.createElement('style');
layoutStyle.innerHTML = layoutStyles;
layoutStyle.id = "layout-styles";
document.head.insertBefore(layoutStyle, document.head.firstChild);
