document.addEventListener('DOMContentLoaded', async () => {
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
            if (item.link) itemContainer.dataset.link = item.link;

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
                        const mdResponse = await fetch(item.link);
                        if (!mdResponse.ok) throw new Error(`无法加载 ${item.link}`);
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
                            
                            // 点击目录项后关闭目录
                            tocLink.addEventListener('click', () => {
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
        const menuItems = await response.json();

        const menu = createMenuItems(menuItems);
        sidebarContent.appendChild(menu);

        // 默认加载第一个有 link 的文件
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

        if (firstLink) {
            const mdResponse = await fetch(firstLink);
            if (mdResponse.ok) {
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

                // 高亮第一个有 link 的项
                const firstLinkElement = sidebarContent.querySelector(`a[data-link="${firstLink}"]`);
                if (firstLinkElement) {
                    firstLinkElement.classList.add('bg-blue-50', 'text-blue-600', 'font-semibold');
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
                    
                    // 点击目录项后关闭目录
                    tocLink.addEventListener('click', () => {
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
            }
        }
    } catch (error) {
        content.innerHTML = `<p class="text-red-500">初始化失败：${error.message}</p>`;
    }

    // 控制左侧导航栏显示/隐藏
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

    // 控制右侧目录显示/隐藏
    tocToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toc.classList.toggle('open');
        sidebar.classList.remove('open');
        const svg = tocToggle.querySelector('svg');
        if (toc.classList.contains('open')) {
            svg.style.transform = 'rotate(180deg)';
            tocTrigger.classList.add('hidden');
            // 移除 backdrop 操作
        } else {
            svg.style.transform = 'rotate(0deg)';
            tocTrigger.classList.remove('hidden');
            // 移除 backdrop 操作
        }
        menuTrigger.classList.remove('hidden');
        const menuSvg = menuToggle.querySelector('svg');
        menuSvg.style.transform = 'rotate(0deg)';
    });

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
        sidebar.classList.remove('open');
        toc.classList.remove('open');
        const menuSvg = menuToggle.querySelector('svg');
        const tocSvg = tocToggle.querySelector('svg');
        menuSvg.style.transform = 'rotate(0deg)';
        tocSvg.style.transform = 'rotate(0deg)';
        menuTrigger.classList.remove('hidden');
        tocTrigger.classList.remove('hidden');
        backdrop.classList.add('hidden');
    };
    content.addEventListener('click', closePanels);
    backdrop.addEventListener('click', closePanels);

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
                tocContent.appendChild(tocLink);
            });
            lastContent = content.innerHTML;
        }
        // ...existing code...
    });
});