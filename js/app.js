document.addEventListener('DOMContentLoaded', async () => {
    // 检查URL参数，如果有doc参数则直接加载对应文档
    const urlParams = new URLSearchParams(window.location.search);
    let docParam = urlParams.get('doc');
    // 保存当前URL中的锚点，以便在加载文档后滚动到对应位置
    const initialHash = window.location.hash;

    // 加载顶部导航栏配置
    const headerLogo = document.getElementById('header-logo');
    const headerButtons = document.getElementById('header-buttons');
    const topNav = document.getElementById('top-nav');

    const sidebarContent = document.getElementById('sidebar-content');
    const content = document.getElementById('content');
    const tocContent = document.getElementById('toc-content');
    const sidebar = document.getElementById('sidebar');
    const toc = document.getElementById('toc');
    const menuToggle = document.getElementById('menu-toggle');
    const tocToggle = document.getElementById('toc-toggle');
    const menuTrigger = document.getElementById('menu-trigger');
    const tocTrigger = document.getElementById('toc-trigger');
    const backdrop = document.getElementById('backdrop');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    
    // 移动端菜单按钮点击事件
    // 检查元素是否存在
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            toc.classList.remove('open');
            menuTrigger.classList.toggle('hidden');
            tocTrigger.classList.remove('hidden');
        });
    }
    


    // 递归生成嵌套菜单
    function createMenuItems(items, level = 0) {
        const ul = document.createElement('ul');
        ul.className = `space-y-1 ${level > 0 ? `ml-${level * 4}` : ''} transition-all duration-300`;

        items.forEach(item => {
            const li = document.createElement('li');
            const hasChildren = item.children && item.children.length > 0;

            // 菜单项容器
            const itemContainer = document.createElement('a'); // 修改为 <a> 标签
            itemContainer.href = item.link || '#';
            itemContainer.className = 'flex items-center justify-between p-2 rounded-md transition-all duration-300 hover:bg-blue-50 hover:text-blue-600';
            if (item.link) itemContainer.dataset.link = item.link.replace(/\.md$/, '');

            // 菜单标题和箭头
            const titleWrapper = document.createElement('div');
            titleWrapper.className = 'flex items-center space-x-2';

            if (hasChildren) {
                const toggleBtn = document.createElement('span'); // 修改为 <span>，使整个容器可点击
                toggleBtn.className = 'text-gray-500 hover:text-blue-600 transition-transform duration-300';
                toggleBtn.innerHTML = `
                    <svg class="w-4 h-4 transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                `;
                titleWrapper.appendChild(toggleBtn);
            }

            const title = document.createElement('span'); // 使用 <span> 包裹文字
            title.className = 'text-gray-600 transition-colors duration-300';
            title.textContent = item.title;
            titleWrapper.appendChild(title);

            itemContainer.appendChild(titleWrapper);
            li.appendChild(itemContainer);

            // 如果有子菜单，递归生成
            if (hasChildren) {
                const subMenu = createMenuItems(item.children, level + 1);
                subMenu.classList.add('hidden');
                li.appendChild(subMenu);

                // 点击整个菜单项展开/收起子菜单
                itemContainer.addEventListener('click', (e) => {
                    e.preventDefault();
                    subMenu.classList.toggle('hidden');
                    const svg = titleWrapper.querySelector('svg');
                    svg.style.transform = subMenu.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
                });
            }

            // 绑定点击事件
            if (item.link) {
                itemContainer.addEventListener('click', async (e) => {
                    if (hasChildren) return; // 如果有子菜单，不执行跳转逻辑
                    e.preventDefault();
                    try {
                        // 更新URL，添加文档参数，保留可能存在的锚点
                        const hash = window.location.hash;
                        const docBase = item.link.replace(/\.md$/, '');
                        const docParamStr = `?doc=${encodeURIComponent(docBase)}${hash}`;
                        history.pushState({docLink: item.link}, '', docParamStr);
                        const mdFile = docBase + '.md';
                        const mdResponse = await fetch(mdFile);
                        if (!mdResponse.ok) throw new Error(`无法加载 ${mdFile}`);
                        const mdText = await mdResponse.text();
                        const html = marked.parse(mdText);
                        const cleanHtml = DOMPurify.sanitize(html);
                        content.innerHTML = cleanHtml;

                        // 添加语言标识
                        const codeBlocks = document.querySelectorAll('#content pre code[class*="language-"]');
                        codeBlocks.forEach(codeBlock => {
                            const pre = codeBlock.parentElement;
                            const languageClass = codeBlock.className.match(/language-(\w+)/);
                            if (languageClass && languageClass[1]) {
                                const language = languageClass[1];

                                // 创建语言标签容器
                                const languageTagContainer = document.createElement('div');
                                languageTagContainer.className = 'language-tag-container';

                                // 创建语言标签
                                const languageTag = document.createElement('div');
                                languageTag.className = 'language-tag';
                                languageTag.textContent = language;

                                // 将语言标签添加到容器
                                languageTagContainer.appendChild(languageTag);

                                // 插入语言标签容器到 <pre>
                                pre.style.position = 'relative'; // 确保 <pre> 为相对定位
                                pre.insertBefore(languageTagContainer, codeBlock); // 在 <code> 前插入语言标签容器
                            }
                        });

                        // 高亮当前选中项
                        sidebarContent.querySelectorAll('a').forEach(a => a.classList.remove('bg-blue-50', 'text-blue-600', 'font-semibold'));
                        itemContainer.classList.add('bg-blue-50', 'text-blue-600', 'font-semibold');

                        // 自动生成目录
                        tocContent.innerHTML = '';
                        const headings = content.querySelectorAll('h1, h2, h3');
                        headings.forEach((heading, index) => {
                            const id = `heading-${index}`;
                            heading.id = id;
                            const tocLink = document.createElement('a');
                            tocLink.href = `#${id}`;
                            tocLink.textContent = heading.textContent;
                            tocLink.className = `${heading.tagName === 'H1' ? 'text-base font-semibold' : heading.tagName === 'H2' ? 'ml-4 text-sm' : 'ml-8 text-sm'} block p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 rounded transform hover:translate-x-1`;
                            
                            // 点击目录项后关闭目录并更新URL
                            tocLink.addEventListener('click', (e) => {
                                e.preventDefault();
                                // 获取当前文档URL
                                const urlParams = new URLSearchParams(window.location.search);
                                const currentDoc = urlParams.get('doc');
                                // 更新URL，保留文档参数并添加锚点
                                const newUrl = currentDoc ? `?doc=${currentDoc}#${id}` : `#${id}`;
                                history.pushState(null, '', newUrl);
                                // 滚动到对应位置
                                document.getElementById(id).scrollIntoView({behavior: 'smooth'});
                                // 在滚动完成后清理URL中的锚点
                                setTimeout(() => {
                                    const cleanUrl = currentDoc ? `?doc=${currentDoc}` : window.location.pathname;
                                    history.replaceState(null, '', cleanUrl);
                                }, 100);
                                closePanels();
                            });

                            tocContent.appendChild(tocLink);
                        });

                        // 滚动到文档头部
                        content.scrollTo({ top: 0, behavior: 'smooth' });

                        // 内容淡入动画，扩大加载范围，包括子元素
                        const allElements = content.querySelectorAll('*');
                        allElements.forEach((el, idx) => {
                            el.style.opacity = '0';
                            el.style.transform = 'translateY(2px)'; // 增加初始偏移量
                            setTimeout(() => {
                                el.style.transition = 'opacity 0.2s ease, transform 0.3s ease'; // 延长动画时间
                                el.style.opacity = '1';
                                el.style.transform = 'translateY(0)';
                            }, idx *10); // 减少延迟间隔以加快整体动画
                        });

                        // 点击项目后关闭导航栏
                        closePanels();
                    } catch (error) {
                        content.innerHTML = `<p class="text-red-500">加载失败：${error.message}</p>`;
                    }
                });
            }

            ul.appendChild(li);
        });

        return ul;
    }

    // 加载 sidebar.json 并生成导航栏
    try {
        const response = await fetch('sidebar.json');
        if (!response.ok) throw new Error('无法加载 sidebar.json');
        const config = await response.json();
        const menuItems = config.menu;

        // 渲染顶部导航栏LOGO
        if (config.header && config.header.logo) {
            if (config.header.logo.type === 'image') {
                const img = document.createElement('img');
                img.src = config.header.logo.content;
                img.alt = 'Logo';
                img.style.width = config.header.logo.width;  // 应用宽度
                img.style.height = config.header.logo.height; // 应用高度
                headerLogo.appendChild(img);
            } else {
                const text = document.createElement('span');
                text.textContent = config.header.logo.content;
                text.className = 'text-xl font-bold text-gray-800';
                headerLogo.appendChild(text);
            }
        }

        // 渲染顶部导航栏按钮
        if (config.header && config.header.buttons) {
            config.header.buttons.forEach(button => {
                const btn = document.createElement('a');
                btn.href = button.link;
                btn.className = 'flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-300';
                if (button.icon) {
                    const iconWrapper = document.createElement('div');
                    iconWrapper.innerHTML = button.icon;
                    btn.appendChild(iconWrapper);
                }
                const text = document.createElement('span');
                text.textContent = button.title;
                text.className = 'hidden sm:inline-block';
                btn.appendChild(text);
                headerButtons.appendChild(btn);
            });
        }

        // 调整主内容区域的上边距，为顶部导航栏留出空间
        document.querySelector('.flex.h-screen').style.marginTop = '64px';

        const menu = createMenuItems(menuItems);
        sidebarContent.appendChild(menu);

        // 确定要加载的文档：优先使用URL参数中的doc，否则使用第一个有link的文件
        let docToLoad = null;
        // 如果URL中指定了文档，则使用该文档
        if (docParam) {
            docToLoad = decodeURIComponent(docParam);
            if (!/\.md$/.test(docToLoad)) docToLoad += '.md';
        }
        // 如果URL中没有指定文档，则查找第一个有link的文件
        if (!docToLoad) {
            let firstLink = null;
            const findFirstLink = (items) => {
                for (const item of items) {
                    if (item.link) {
                        firstLink = item.link;
                        return;
                    }
                    if (item.children) findFirstLink(item.children);
                }
            };
            findFirstLink(menuItems);
            docToLoad = firstLink;
        }
        if (docToLoad) {
            const mdFile = docToLoad.endsWith('.md') ? docToLoad : docToLoad + '.md';
            const mdResponse = await fetch(mdFile);
            if (mdResponse.ok) {
                const mdText = await mdResponse.text();
                const html = marked.parse(mdText);
                const cleanHtml = DOMPurify.sanitize(html);
                content.innerHTML = cleanHtml;
                
                // 保存当前URL中的锚点，以便在生成目录后滚动到对应位置
                const currentHash = window.location.hash;

                // 添加语言标识
                const codeBlocks = document.querySelectorAll('#content pre code[class*="language-"]');
                codeBlocks.forEach(codeBlock => {
                    const pre = codeBlock.parentElement;
                    const languageClass = codeBlock.className.match(/language-(\w+)/);
                    if (languageClass && languageClass[1]) {
                        const language = languageClass[1];

                        // 创建语言标签容器
                        const languageTagContainer = document.createElement('div');
                        languageTagContainer.className = 'language-tag-container';

                        // 创建语言标签
                        const languageTag = document.createElement('div');
                        languageTag.className = 'language-tag';
                        languageTag.textContent = language;

                        // 将语言标签添加到容器
                        languageTagContainer.appendChild(languageTag);

                        // 插入语言标签容器到 <pre>
                        pre.style.position = 'relative'; // 确保 <pre> 为相对定位
                        pre.insertBefore(languageTagContainer, codeBlock); // 在 <code> 前插入语言标签容器
                    }
                });

                // 高亮当前加载的文档对应的侧边栏项
                const docLinkElement = sidebarContent.querySelector(`a[data-link="${docToLoad.replace(/\.md$/, '')}"]`);
                if (docLinkElement) {
                    docLinkElement.classList.add('bg-blue-50', 'text-blue-600', 'font-semibold');
                    // 如果是通过URL参数加载的文档，更新URL
                    if (docParam) {
                        history.replaceState({docLink: docToLoad}, '', `?doc=${encodeURIComponent(docToLoad.replace(/\.md$/, ''))}`);
                    }
                }

                // 初始生成目录
                const headings = content.querySelectorAll('h1, h2, h3');
                headings.forEach((heading, index) => {
                    const id = `heading-${index}`;
                    heading.id = id;
                    const tocLink = document.createElement('a');
                    tocLink.href = `#${id}`;
                    tocLink.textContent = heading.textContent;
                    tocLink.className = `${heading.tagName === 'H1' ? 'text-base font-semibold' : heading.tagName === 'H2' ? 'ml-4 text-sm' : 'ml-8 text-sm'} block p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 rounded transform hover:translate-x-1`;
                    
                    // 点击目录项后关闭目录并更新URL
                    tocLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        // 获取当前文档URL
                        const urlParams = new URLSearchParams(window.location.search);
                        const currentDoc = urlParams.get('doc');
                        // 更新URL，保留文档参数并添加锚点
                        const newUrl = currentDoc ? `?doc=${currentDoc}#${id}` : `#${id}`;
                        history.pushState(null, '', newUrl);
                        // 滚动到对应位置
                        document.getElementById(id).scrollIntoView({behavior: 'smooth'});
                        closePanels();
                    });

                    tocContent.appendChild(tocLink);
                });

                // 初始内容淡入动画
                content.querySelectorAll('h1, h2, h3, p, pre, ul, ol, table, blockquote').forEach((el, idx) => {
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }, idx * 100);
                });
                
                // 检查URL中是否有锚点，如果有则滚动到对应位置
                if (currentHash) {
                    const id = currentHash.substring(1);
                    const element = document.getElementById(id);
                    if (element) {
                        setTimeout(() => {
                            element.scrollIntoView({behavior: 'smooth'});
                        }, 500); // 延迟滚动，确保内容和动画已加载
                    }
                }
            }
        }
    } catch (error) {
        content.innerHTML = `<p class="text-red-500">初始化失败：${error.message}</p>`;
    }

    // 控制左侧导航栏显示/隐藏
    // 检查元素是否存在
    // 控制左侧导航栏
    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
            toc.classList.remove('open');
            const svg = menuToggle.querySelector('svg');
            if (sidebar.classList.contains('open')) {
                svg.style.transform = 'rotate(180deg)';
                menuTrigger.classList.add('hidden');
                // 移除 backdrop 操作
            } else {
                svg.style.transform = 'rotate(0deg)';
                menuTrigger.classList.remove('hidden');
                // 移除 backdrop 操作
            }
            tocTrigger.classList.remove('hidden');
            const tocSvg = tocToggle.querySelector('svg');
            tocSvg.style.transform = 'rotate(0deg)';
        });
    }
    
    // 控制右侧目录 - 增加媒体查询适配
    if (tocToggle && document.contains(tocToggle) && window.getComputedStyle(tocToggle).display !== 'none') {
        console.log('[Debug] 初始化目录按钮可见性:', window.getComputedStyle(tocToggle).display);
        tocToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            // 增加屏幕宽度判断
            if (window.innerWidth < 768) {
                toc.classList.toggle('open');
                sidebar.classList.remove('open');
            }
            const svg = tocToggle.querySelector('svg');
            if (toc.classList.contains('open')) {
                svg.style.transform = 'rotate(180deg)';
                tocTrigger.classList.add('hidden');
            } else {
                svg.style.transform = 'rotate(0deg)';
                tocTrigger.classList.remove('hidden');
            }
            menuTrigger.classList.remove('hidden');
            const menuSvg = menuToggle.querySelector('svg');
            menuSvg.style.transform = 'rotate(0deg)';
        });
    }

    // 右侧触发点点击事件
    tocTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toc.classList.add('open');
        sidebar.classList.remove('open');
        tocTrigger.classList.add('hidden');
        menuTrigger.classList.remove('hidden');
        const menuSvg = menuToggle.querySelector('svg');
        menuSvg.style.transform = 'rotate(0deg)';
        // 移除 backdrop 操作
    });

    // 左侧触发点点击事件
    menuTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.add('open');
        toc.classList.remove('open');
        menuTrigger.classList.add('hidden');
        tocTrigger.classList.remove('hidden');
        const tocSvg = tocToggle.querySelector('svg');
        tocSvg.style.transform = 'rotate(0deg)';
        // 移除 backdrop 操作
    });

    // 点击内容区或背景遮罩关闭导航栏和目录
    const closePanels = () => {
        if (sidebar && toc && menuToggle && tocToggle && menuTrigger && tocTrigger) {
            sidebar.classList.remove('open');
            toc.classList.remove('open');
            const menuSvg = menuToggle.querySelector('svg');
            const tocSvg = tocToggle.querySelector('svg');
            if (menuSvg) menuSvg.style.transform = 'rotate(0deg)';
            if (tocSvg) tocSvg.style.transform = 'rotate(0deg)';
            menuTrigger.classList.remove('hidden');
            tocTrigger.classList.remove('hidden');
            if (backdrop) backdrop.classList.add('hidden');
        }
    }
    content.addEventListener('click', closePanels);


    // 点击目录内部链接时不关闭目录，但允许滚动
    tocContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // 点击导航栏内部链接时不关闭导航栏
    sidebarContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // 添加滚动时暂停动画
    let timeout;
    content.addEventListener('scroll', () => {
        content.classList.add('no-animation');
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            content.classList.remove('no-animation');
        }, 200); // 滚动停止 200ms 后恢复动画
    });
    
    // 检查URL中是否有锚点，如果有则滚动到对应位置
    if (window.location.hash) {
        const id = window.location.hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
            setTimeout(() => {
                element.scrollIntoView({behavior: 'smooth'});
            }, 500); // 延迟滚动，确保内容已加载
        }
    }

    // 缓存目录生成逻辑
    let lastContent = '';
    content.addEventListener('click', async (e) => { // 修复 itemContainer 的作用域问题
        // ...existing code...
        if (content.innerHTML !== lastContent) {
            tocContent.innerHTML = '';
            const headings = content.querySelectorAll('h1, h2, h3'); // 修复未定义的变量
            headings.forEach((heading, index) => {
                const id = `heading-${index}`;
                heading.id = id;
                const tocLink = document.createElement('a');
                tocLink.href = `#${id}`;
                tocLink.textContent = heading.textContent;
                tocLink.className = `${heading.tagName === 'H1' ? 'text-base font-semibold' : heading.tagName === 'H2' ? 'ml-4 text-sm' : 'ml-8 text-sm'} block p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 rounded transform hover:translate-x-1`;
                
                // 点击目录项后更新URL
                tocLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    // 获取当前文档URL
                    const urlParams = new URLSearchParams(window.location.search);
                    const currentDoc = urlParams.get('doc');
                    // 更新URL，保留文档参数并添加锚点
                    const newUrl = currentDoc ? `?doc=${currentDoc}#${id}` : `#${id}`;
                    history.pushState(null, '', newUrl);
                    // 滚动到对应位置
                    document.getElementById(id).scrollIntoView({behavior: 'smooth'});
                });
                
                tocContent.appendChild(tocLink);
            });
            lastContent = content.innerHTML;
        }
    });
});