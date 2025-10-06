(function () {
   'use strict';

   let isMenuOpen = false;


   function hideContextMenu() {
      const menu = document.getElementById('custom-context-menu');
      if (menu) {
         menu.style.display = 'none';
         isMenuOpen = false;
      }
   }


   document.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      showContextMenu(e.pageX, e.pageY);
   });


   document.addEventListener('click', function (e) {
      const menu = document.getElementById('custom-context-menu');
      if (menu && menu.contains(e.target)) {

         return;
      }

      if (isMenuOpen && e.button !== 2) {

         hideContextMenu();
      } else if (!isMenuOpen) {

         hideContextMenu();
      }
   });


   function createContextMenu() {
      const menu = document.createElement('div');
      menu.id = 'custom-context-menu';
      menu.innerHTML = `
            <div class="context-menu-item" data-action="aboutblank">
                <span>Open in about:blank</span>
            </div>
            <div class="context-menu-item" data-action="reload">
                <span>Reload</span>
            </div>
            <div class="context-menu-item" data-action="copylink">
                <span>Copy Link</span>
            </div>
        `;


      const style = document.createElement('style');
      style.textContent = `
            #custom-context-menu {
                position: absolute;
                background: #1f3434;
                backdrop-filter: blur(20px);
                border: 2px solid #203b3b;
                border-radius: 8px;
                padding: 8px 0;
                min-width: 220px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                z-index: 99999;
                font-family: 'Poppins', Arial, sans-serif;
                display: none;
                cursor: url('comic.cur'), auto;
            }

            .context-menu-item {
                padding: 10px 16px;
                color: #ffffff;
                cursor: url('comic.cur'), pointer;
                display: flex;
                align-items: center;
                transition: all 0.2s ease;
                font-size: 0.95rem;
            }

            .context-menu-item:hover {
                background: #223d3d;
                color: #338383ff;
            }

            .context-menu-item.disabled {
                color: #666;
                cursor: not-allowed;
                pointer-events: none;
            }

            .context-menu-divider {
                height: 1px;
                background: #203b3b;
                margin: 6px 8px;
            }

            #custom-context-menu::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(31, 52, 52, 0.95);
                border-radius: 8px;
                z-index: -1;
            }
        `;

      document.head.appendChild(style);
      document.body.appendChild(menu);


      menu.addEventListener('click', handleMenuClick);
   }

   function showContextMenu(x, y) {
      let menu = document.getElementById('custom-context-menu');

      if (!menu) {
         createContextMenu();
         menu = document.getElementById('custom-context-menu');
      }


      menu.style.left = x + 'px';
      menu.style.top = y + 'px';
      menu.style.display = 'block';
      isMenuOpen = true;


      const menuRect = menu.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      if (menuRect.right > windowWidth) {
         menu.style.left = (x - menuRect.width) + 'px';
      }

      if (menuRect.bottom > windowHeight) {
         menu.style.top = (y - menuRect.height) + 'px';
      }
   }

   function handleMenuClick(e) {
      const item = e.target.closest('.context-menu-item');
      if (!item || item.classList.contains('disabled')) return;

      const action = item.getAttribute('data-action');
      executeAction(action);
      hideContextMenu();
   }

   function executeAction(action) {
      switch (action) {
         case 'aboutblank':
            openInAboutBlank();
            break;

         case 'reload':
            window.location.reload();
            break;

         case 'copylink':
            copyLink();
            break;
      }
   }

   function copyLink() {
      const url = window.location.href;

      if (navigator.clipboard && navigator.clipboard.writeText) {
         navigator.clipboard.writeText(url).then(() => {
            showNotification('Link copied!', '#223d3d');
         }).catch(() => {
            fallbackCopy(url);
         });
      } else {
         fallbackCopy(url);
      }
   }

   function fallbackCopy(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
         document.execCommand('copy');
         showNotification('Link copied!', '#223d3d');
      } catch (err) {
         showNotification('Failed to copy link', '#3d2222');
      }
      document.body.removeChild(textarea);
   }

   function showNotification(message, bgColor) {
      const notification = document.createElement('div');
      notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            border: 2px solid #203b3b;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            z-index: 100000;
            font-family: 'Poppins', Arial, sans-serif;
            animation: slideIn 0.3s ease;
        `;
      notification.textContent = message;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
   }
   function openInAboutBlank() {
      const currentUrl = window.location.href;
      const aboutBlankWindow = window.open('about:blank', '_blank');

      if (aboutBlankWindow) {
         aboutBlankWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>New Tab</title>
                    <style>
                        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
                        iframe { width: 100%; height: 100%; border: none; }
                    </style>
                </head>
                <body>
                    <iframe src="${currentUrl}"></iframe>
                </body>
                </html>
            `);
         aboutBlankWindow.document.close();
      }
   }
   if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createContextMenu);
   } else {
      createContextMenu();
   }
   window.addEventListener('scroll', hideContextMenu);
   document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
         hideContextMenu();
      }
   });

})();