import '/node_modules/.pnpm/vite@2.9.15_sass@1.32.12/node_modules/vite/dist/client/env.mjs';

const template = /*html*/ `
<style>
:host {
  position: fixed;
  z-index: 99999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  margin: 0;
  background: rgba(0, 0, 0, 0.66);
  --monospace: 'SFMono-Regular', Consolas,
              'Liberation Mono', Menlo, Courier, monospace;
  --red: #ff5555;
  --yellow: #e2aa53;
  --purple: #cfa4ff;
  --cyan: #2dd9da;
  --dim: #c9c9c9;
}

.window {
  font-family: var(--monospace);
  line-height: 1.5;
  width: 800px;
  color: #d8d8d8;
  margin: 30px auto;
  padding: 25px 40px;
  position: relative;
  background: #181818;
  border-radius: 6px 6px 8px 8px;
  box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
  overflow: hidden;
  border-top: 8px solid var(--red);
  direction: ltr;
  text-align: left;
}

pre {
  font-family: var(--monospace);
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 1em;
  overflow-x: scroll;
  scrollbar-width: none;
}

pre::-webkit-scrollbar {
  display: none;
}

.message {
  line-height: 1.3;
  font-weight: 600;
  white-space: pre-wrap;
}

.message-body {
  color: var(--red);
}

.plugin {
  color: var(--purple);
}

.file {
  color: var(--cyan);
  margin-bottom: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.frame {
  color: var(--yellow);
}

.stack {
  font-size: 13px;
  color: var(--dim);
}

.tip {
  font-size: 13px;
  color: #999;
  border-top: 1px dotted #999;
  padding-top: 13px;
}

code {
  font-size: 13px;
  font-family: var(--monospace);
  color: var(--yellow);
}

.file-link {
  text-decoration: underline;
  cursor: pointer;
}
</style>
<div class="window">
  <pre class="message"><span class="plugin"></span><span class="message-body"></span></pre>
  <pre class="file"></pre>
  <pre class="frame"></pre>
  <pre class="stack"></pre>
  <div class="tip">
    Click outside or fix the code to dismiss.<br>
    You can also disable this overlay by setting
    <code>server.hmr.overlay</code> to <code>false</code> in <code>vite.config.js.</code>
  </div>
</div>
`;
const fileRE = /(?:[a-zA-Z]:\\|\/).*?:\d+:\d+/g;
const codeframeRE = /^(?:>?\s+\d+\s+\|.*|\s+\|\s*\^.*)\r?\n/gm;
class ErrorOverlay extends HTMLElement {
    constructor(err) {
        var _a;
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this.root.innerHTML = template;
        codeframeRE.lastIndex = 0;
        const hasFrame = err.frame && codeframeRE.test(err.frame);
        const message = hasFrame
            ? err.message.replace(codeframeRE, '')
            : err.message;
        if (err.plugin) {
            this.text('.plugin', `[plugin:${err.plugin}] `);
        }
        this.text('.message-body', message.trim());
        const [file] = (((_a = err.loc) === null || _a === void 0 ? void 0 : _a.file) || err.id || 'unknown file').split(`?`);
        if (err.loc) {
            this.text('.file', `${file}:${err.loc.line}:${err.loc.column}`, true);
        }
        else if (err.id) {
            this.text('.file', file);
        }
        if (hasFrame) {
            this.text('.frame', err.frame.trim());
        }
        this.text('.stack', err.stack, true);
        this.root.querySelector('.window').addEventListener('click', (e) => {
            e.stopPropagation();
        });
        this.addEventListener('click', () => {
            this.close();
        });
    }
    text(selector, text, linkFiles = false) {
        const el = this.root.querySelector(selector);
        if (!linkFiles) {
            el.textContent = text;
        }
        else {
            let curIndex = 0;
            let match;
            while ((match = fileRE.exec(text))) {
                const { 0: file, index } = match;
                if (index != null) {
                    const frag = text.slice(curIndex, index);
                    el.appendChild(document.createTextNode(frag));
                    const link = document.createElement('a');
                    link.textContent = file;
                    link.className = 'file-link';
                    link.onclick = () => {
                        fetch('/__open-in-editor?file=' + encodeURIComponent(file));
                    };
                    el.appendChild(link);
                    curIndex += frag.length + file.length;
                }
            }
        }
    }
    close() {
        var _a;
        (_a = this.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(this);
    }
}
const overlayId = 'vite-error-overlay';
if (customElements && !customElements.get(overlayId)) {
    customElements.define(overlayId, ErrorOverlay);
}

console.log('[vite] connecting...');
// use server configuration, then fallback to inference
const socketProtocol = null || (location.protocol === 'https:' ? 'wss' : 'ws');
const socketHost = `${null || location.hostname}:${"9000"}`;
const socket = new WebSocket(`${socketProtocol}://${socketHost}`, 'vite-hmr');
const base = "/" || '/';
const messageBuffer = [];
function warnFailedFetch(err, path) {
    if (!err.message.match('fetch')) {
        console.error(err);
    }
    console.error(`[hmr] Failed to reload ${path}. ` +
        `This could be due to syntax errors or importing non-existent ` +
        `modules. (see errors above)`);
}
function cleanUrl(pathname) {
    const url = new URL(pathname, location.toString());
    url.searchParams.delete('direct');
    return url.pathname + url.search;
}
// Listen for messages
socket.addEventListener('message', async ({ data }) => {
    handleMessage(JSON.parse(data));
});
let isFirstUpdate = true;
async function handleMessage(payload) {
    switch (payload.type) {
        case 'connected':
            console.log(`[vite] connected.`);
            sendMessageBuffer();
            // proxy(nginx, docker) hmr ws maybe caused timeout,
            // so send ping package let ws keep alive.
            setInterval(() => socket.send('{"type":"ping"}'), 30000);
            break;
        case 'update':
            notifyListeners('vite:beforeUpdate', payload);
            // if this is the first update and there's already an error overlay, it
            // means the page opened with existing server compile error and the whole
            // module script failed to load (since one of the nested imports is 500).
            // in this case a normal update won't work and a full reload is needed.
            if (isFirstUpdate && hasErrorOverlay()) {
                window.location.reload();
                return;
            }
            else {
                clearErrorOverlay();
                isFirstUpdate = false;
            }
            payload.updates.forEach((update) => {
                if (update.type === 'js-update') {
                    queueUpdate(fetchUpdate(update));
                }
                else {
                    // css-update
                    // this is only sent when a css file referenced with <link> is updated
                    const { path, timestamp } = update;
                    const searchUrl = cleanUrl(path);
                    // can't use querySelector with `[href*=]` here since the link may be
                    // using relative paths so we need to use link.href to grab the full
                    // URL for the include check.
                    const el = Array.from(document.querySelectorAll('link')).find((e) => cleanUrl(e.href).includes(searchUrl));
                    if (el) {
                        const newPath = `${base}${searchUrl.slice(1)}${searchUrl.includes('?') ? '&' : '?'}t=${timestamp}`;
                        // rather than swapping the href on the existing tag, we will
                        // create a new link tag. Once the new stylesheet has loaded we
                        // will remove the existing link tag. This removes a Flash Of
                        // Unstyled Content that can occur when swapping out the tag href
                        // directly, as the new stylesheet has not yet been loaded.
                        const newLinkTag = el.cloneNode();
                        newLinkTag.href = new URL(newPath, el.href).href;
                        const removeOldEl = () => el.remove();
                        newLinkTag.addEventListener('load', removeOldEl);
                        newLinkTag.addEventListener('error', removeOldEl);
                        el.after(newLinkTag);
                    }
                    console.log(`[vite] css hot updated: ${searchUrl}`);
                }
            });
            break;
        case 'custom': {
            notifyListeners(payload.event, payload.data);
            break;
        }
        case 'full-reload':
            notifyListeners('vite:beforeFullReload', payload);
            if (payload.path && payload.path.endsWith('.html')) {
                // if html file is edited, only reload the page if the browser is
                // currently on that page.
                const pagePath = decodeURI(location.pathname);
                const payloadPath = base + payload.path.slice(1);
                if (pagePath === payloadPath ||
                    (pagePath.endsWith('/') && pagePath + 'index.html' === payloadPath)) {
                    location.reload();
                }
                return;
            }
            else {
                location.reload();
            }
            break;
        case 'prune':
            notifyListeners('vite:beforePrune', payload);
            // After an HMR update, some modules are no longer imported on the page
            // but they may have left behind side effects that need to be cleaned up
            // (.e.g style injections)
            // TODO Trigger their dispose callbacks.
            payload.paths.forEach((path) => {
                const fn = pruneMap.get(path);
                if (fn) {
                    fn(dataMap.get(path));
                }
            });
            break;
        case 'error': {
            notifyListeners('vite:error', payload);
            const err = payload.err;
            if (enableOverlay) {
                createErrorOverlay(err);
            }
            else {
                console.error(`[vite] Internal Server Error\n${err.message}\n${err.stack}`);
            }
            break;
        }
        default: {
            const check = payload;
            return check;
        }
    }
}
function notifyListeners(event, data) {
    const cbs = customListenersMap.get(event);
    if (cbs) {
        cbs.forEach((cb) => cb(data));
    }
}
const enableOverlay = true;
function createErrorOverlay(err) {
    if (!enableOverlay)
        return;
    clearErrorOverlay();
    document.body.appendChild(new ErrorOverlay(err));
}
function clearErrorOverlay() {
    document
        .querySelectorAll(overlayId)
        .forEach((n) => n.close());
}
function hasErrorOverlay() {
    return document.querySelectorAll(overlayId).length;
}
let pending = false;
let queued = [];
/**
 * buffer multiple hot updates triggered by the same src change
 * so that they are invoked in the same order they were sent.
 * (otherwise the order may be inconsistent because of the http request round trip)
 */
async function queueUpdate(p) {
    queued.push(p);
    if (!pending) {
        pending = true;
        await Promise.resolve();
        pending = false;
        const loading = [...queued];
        queued = [];
        (await Promise.all(loading)).forEach((fn) => fn && fn());
    }
}
async function waitForSuccessfulPing(ms = 1000) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            const pingResponse = await fetch(`${base}__vite_ping`);
            // success - 2xx status code
            if (pingResponse.ok)
                break;
            // failure - non-2xx status code
            else
                throw new Error();
        }
        catch (e) {
            // wait ms before attempting to ping again
            await new Promise((resolve) => setTimeout(resolve, ms));
        }
    }
}
// ping server
socket.addEventListener('close', async ({ wasClean }) => {
    if (wasClean)
        return;
    console.log(`[vite] server connection lost. polling for restart...`);
    await waitForSuccessfulPing();
    location.reload();
});
const sheetsMap = new Map();
function updateStyle(id, content) {
    let style = sheetsMap.get(id);
    {
        if (style && !(style instanceof HTMLStyleElement)) {
            removeStyle(id);
            style = undefined;
        }
        if (!style) {
            style = document.createElement('style');
            style.setAttribute('type', 'text/css');
            style.innerHTML = content;
            document.head.appendChild(style);
        }
        else {
            style.innerHTML = content;
        }
    }
    sheetsMap.set(id, style);
}
function removeStyle(id) {
    const style = sheetsMap.get(id);
    if (style) {
        if (style instanceof CSSStyleSheet) {
            // @ts-expect-error: using experimental API
            document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== style);
        }
        else {
            document.head.removeChild(style);
        }
        sheetsMap.delete(id);
    }
}
async function fetchUpdate({ path, acceptedPath, timestamp }) {
    const mod = hotModulesMap.get(path);
    if (!mod) {
        // In a code-splitting project,
        // it is common that the hot-updating module is not loaded yet.
        // https://github.com/vitejs/vite/issues/721
        return;
    }
    const moduleMap = new Map();
    const isSelfUpdate = path === acceptedPath;
    // make sure we only import each dep once
    const modulesToUpdate = new Set();
    if (isSelfUpdate) {
        // self update - only update self
        modulesToUpdate.add(path);
    }
    else {
        // dep update
        for (const { deps } of mod.callbacks) {
            deps.forEach((dep) => {
                if (acceptedPath === dep) {
                    modulesToUpdate.add(dep);
                }
            });
        }
    }
    // determine the qualified callbacks before we re-import the modules
    const qualifiedCallbacks = mod.callbacks.filter(({ deps }) => {
        return deps.some((dep) => modulesToUpdate.has(dep));
    });
    await Promise.all(Array.from(modulesToUpdate).map(async (dep) => {
        const disposer = disposeMap.get(dep);
        if (disposer)
            await disposer(dataMap.get(dep));
        const [path, query] = dep.split(`?`);
        try {
            const newMod = await import(
            /* @vite-ignore */
            base +
                path.slice(1) +
                `?import&t=${timestamp}${query ? `&${query}` : ''}`);
            moduleMap.set(dep, newMod);
        }
        catch (e) {
            warnFailedFetch(e, dep);
        }
    }));
    return () => {
        for (const { deps, fn } of qualifiedCallbacks) {
            fn(deps.map((dep) => moduleMap.get(dep)));
        }
        const loggedPath = isSelfUpdate ? path : `${acceptedPath} via ${path}`;
        console.log(`[vite] hot updated: ${loggedPath}`);
    };
}
function sendMessageBuffer() {
    if (socket.readyState === 1) {
        messageBuffer.forEach((msg) => socket.send(msg));
        messageBuffer.length = 0;
    }
}
const hotModulesMap = new Map();
const disposeMap = new Map();
const pruneMap = new Map();
const dataMap = new Map();
const customListenersMap = new Map();
const ctxToListenersMap = new Map();
function createHotContext(ownerPath) {
    if (!dataMap.has(ownerPath)) {
        dataMap.set(ownerPath, {});
    }
    // when a file is hot updated, a new context is created
    // clear its stale callbacks
    const mod = hotModulesMap.get(ownerPath);
    if (mod) {
        mod.callbacks = [];
    }
    // clear stale custom event listeners
    const staleListeners = ctxToListenersMap.get(ownerPath);
    if (staleListeners) {
        for (const [event, staleFns] of staleListeners) {
            const listeners = customListenersMap.get(event);
            if (listeners) {
                customListenersMap.set(event, listeners.filter((l) => !staleFns.includes(l)));
            }
        }
    }
    const newListeners = new Map();
    ctxToListenersMap.set(ownerPath, newListeners);
    function acceptDeps(deps, callback = () => { }) {
        const mod = hotModulesMap.get(ownerPath) || {
            id: ownerPath,
            callbacks: []
        };
        mod.callbacks.push({
            deps,
            fn: callback
        });
        hotModulesMap.set(ownerPath, mod);
    }
    const hot = {
        get data() {
            return dataMap.get(ownerPath);
        },
        accept(deps, callback) {
            if (typeof deps === 'function' || !deps) {
                // self-accept: hot.accept(() => {})
                acceptDeps([ownerPath], ([mod]) => deps && deps(mod));
            }
            else if (typeof deps === 'string') {
                // explicit deps
                acceptDeps([deps], ([mod]) => callback && callback(mod));
            }
            else if (Array.isArray(deps)) {
                acceptDeps(deps, callback);
            }
            else {
                throw new Error(`invalid hot.accept() usage.`);
            }
        },
        acceptDeps() {
            throw new Error(`hot.acceptDeps() is deprecated. ` +
                `Use hot.accept() with the same signature instead.`);
        },
        dispose(cb) {
            disposeMap.set(ownerPath, cb);
        },
        // @ts-expect-error untyped
        prune(cb) {
            pruneMap.set(ownerPath, cb);
        },
        // TODO
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        decline() { },
        invalidate() {
            // TODO should tell the server to re-perform hmr propagation
            // from this module as root
            location.reload();
        },
        // custom events
        on(event, cb) {
            const addToMap = (map) => {
                const existing = map.get(event) || [];
                existing.push(cb);
                map.set(event, existing);
            };
            addToMap(customListenersMap);
            addToMap(newListeners);
        },
        send(event, data) {
            messageBuffer.push(JSON.stringify({ type: 'custom', event, data }));
            sendMessageBuffer();
        }
    };
    return hot;
}
/**
 * urls here are dynamic import() urls that couldn't be statically analyzed
 */
function injectQuery(url, queryToInject) {
    // skip urls that won't be handled by vite
    if (!url.startsWith('.') && !url.startsWith('/')) {
        return url;
    }
    // can't use pathname from URL since it may be relative like ../
    const pathname = url.replace(/#.*$/, '').replace(/\?.*$/, '');
    const { search, hash } = new URL(url, 'http://vitejs.dev');
    return `${pathname}?${queryToInject}${search ? `&` + search.slice(1) : ''}${hash || ''}`;
}

export { ErrorOverlay, createHotContext, injectQuery, removeStyle, updateStyle };
//# sourceMappingURL=client.mjs.map

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50Lm1qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaWVudC9vdmVybGF5LnRzIiwiLi4vLi4vc3JjL2NsaWVudC9jbGllbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBFcnJvclBheWxvYWQgfSBmcm9tICd0eXBlcy9obXJQYXlsb2FkJ1xuXG5jb25zdCB0ZW1wbGF0ZSA9IC8qaHRtbCovIGBcbjxzdHlsZT5cbjpob3N0IHtcbiAgcG9zaXRpb246IGZpeGVkO1xuICB6LWluZGV4OiA5OTk5OTtcbiAgdG9wOiAwO1xuICBsZWZ0OiAwO1xuICB3aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiAxMDAlO1xuICBvdmVyZmxvdy15OiBzY3JvbGw7XG4gIG1hcmdpbjogMDtcbiAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjY2KTtcbiAgLS1tb25vc3BhY2U6ICdTRk1vbm8tUmVndWxhcicsIENvbnNvbGFzLFxuICAgICAgICAgICAgICAnTGliZXJhdGlvbiBNb25vJywgTWVubG8sIENvdXJpZXIsIG1vbm9zcGFjZTtcbiAgLS1yZWQ6ICNmZjU1NTU7XG4gIC0teWVsbG93OiAjZTJhYTUzO1xuICAtLXB1cnBsZTogI2NmYTRmZjtcbiAgLS1jeWFuOiAjMmRkOWRhO1xuICAtLWRpbTogI2M5YzljOTtcbn1cblxuLndpbmRvdyB7XG4gIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vc3BhY2UpO1xuICBsaW5lLWhlaWdodDogMS41O1xuICB3aWR0aDogODAwcHg7XG4gIGNvbG9yOiAjZDhkOGQ4O1xuICBtYXJnaW46IDMwcHggYXV0bztcbiAgcGFkZGluZzogMjVweCA0MHB4O1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGJhY2tncm91bmQ6ICMxODE4MTg7XG4gIGJvcmRlci1yYWRpdXM6IDZweCA2cHggOHB4IDhweDtcbiAgYm94LXNoYWRvdzogMCAxOXB4IDM4cHggcmdiYSgwLDAsMCwwLjMwKSwgMCAxNXB4IDEycHggcmdiYSgwLDAsMCwwLjIyKTtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgYm9yZGVyLXRvcDogOHB4IHNvbGlkIHZhcigtLXJlZCk7XG4gIGRpcmVjdGlvbjogbHRyO1xuICB0ZXh0LWFsaWduOiBsZWZ0O1xufVxuXG5wcmUge1xuICBmb250LWZhbWlseTogdmFyKC0tbW9ub3NwYWNlKTtcbiAgZm9udC1zaXplOiAxNnB4O1xuICBtYXJnaW4tdG9wOiAwO1xuICBtYXJnaW4tYm90dG9tOiAxZW07XG4gIG92ZXJmbG93LXg6IHNjcm9sbDtcbiAgc2Nyb2xsYmFyLXdpZHRoOiBub25lO1xufVxuXG5wcmU6Oi13ZWJraXQtc2Nyb2xsYmFyIHtcbiAgZGlzcGxheTogbm9uZTtcbn1cblxuLm1lc3NhZ2Uge1xuICBsaW5lLWhlaWdodDogMS4zO1xuICBmb250LXdlaWdodDogNjAwO1xuICB3aGl0ZS1zcGFjZTogcHJlLXdyYXA7XG59XG5cbi5tZXNzYWdlLWJvZHkge1xuICBjb2xvcjogdmFyKC0tcmVkKTtcbn1cblxuLnBsdWdpbiB7XG4gIGNvbG9yOiB2YXIoLS1wdXJwbGUpO1xufVxuXG4uZmlsZSB7XG4gIGNvbG9yOiB2YXIoLS1jeWFuKTtcbiAgbWFyZ2luLWJvdHRvbTogMDtcbiAgd2hpdGUtc3BhY2U6IHByZS13cmFwO1xuICB3b3JkLWJyZWFrOiBicmVhay1hbGw7XG59XG5cbi5mcmFtZSB7XG4gIGNvbG9yOiB2YXIoLS15ZWxsb3cpO1xufVxuXG4uc3RhY2sge1xuICBmb250LXNpemU6IDEzcHg7XG4gIGNvbG9yOiB2YXIoLS1kaW0pO1xufVxuXG4udGlwIHtcbiAgZm9udC1zaXplOiAxM3B4O1xuICBjb2xvcjogIzk5OTtcbiAgYm9yZGVyLXRvcDogMXB4IGRvdHRlZCAjOTk5O1xuICBwYWRkaW5nLXRvcDogMTNweDtcbn1cblxuY29kZSB7XG4gIGZvbnQtc2l6ZTogMTNweDtcbiAgZm9udC1mYW1pbHk6IHZhcigtLW1vbm9zcGFjZSk7XG4gIGNvbG9yOiB2YXIoLS15ZWxsb3cpO1xufVxuXG4uZmlsZS1saW5rIHtcbiAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cbjwvc3R5bGU+XG48ZGl2IGNsYXNzPVwid2luZG93XCI+XG4gIDxwcmUgY2xhc3M9XCJtZXNzYWdlXCI+PHNwYW4gY2xhc3M9XCJwbHVnaW5cIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJtZXNzYWdlLWJvZHlcIj48L3NwYW4+PC9wcmU+XG4gIDxwcmUgY2xhc3M9XCJmaWxlXCI+PC9wcmU+XG4gIDxwcmUgY2xhc3M9XCJmcmFtZVwiPjwvcHJlPlxuICA8cHJlIGNsYXNzPVwic3RhY2tcIj48L3ByZT5cbiAgPGRpdiBjbGFzcz1cInRpcFwiPlxuICAgIENsaWNrIG91dHNpZGUgb3IgZml4IHRoZSBjb2RlIHRvIGRpc21pc3MuPGJyPlxuICAgIFlvdSBjYW4gYWxzbyBkaXNhYmxlIHRoaXMgb3ZlcmxheSBieSBzZXR0aW5nXG4gICAgPGNvZGU+c2VydmVyLmhtci5vdmVybGF5PC9jb2RlPiB0byA8Y29kZT5mYWxzZTwvY29kZT4gaW4gPGNvZGU+dml0ZS5jb25maWcuanMuPC9jb2RlPlxuICA8L2Rpdj5cbjwvZGl2PlxuYFxuXG5jb25zdCBmaWxlUkUgPSAvKD86W2EtekEtWl06XFxcXHxcXC8pLio/OlxcZCs6XFxkKy9nXG5jb25zdCBjb2RlZnJhbWVSRSA9IC9eKD86Pj9cXHMrXFxkK1xccytcXHwuKnxcXHMrXFx8XFxzKlxcXi4qKVxccj9cXG4vZ21cblxuZXhwb3J0IGNsYXNzIEVycm9yT3ZlcmxheSBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgcm9vdDogU2hhZG93Um9vdFxuXG4gIGNvbnN0cnVjdG9yKGVycjogRXJyb3JQYXlsb2FkWydlcnInXSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLnJvb3QgPSB0aGlzLmF0dGFjaFNoYWRvdyh7IG1vZGU6ICdvcGVuJyB9KVxuICAgIHRoaXMucm9vdC5pbm5lckhUTUwgPSB0ZW1wbGF0ZVxuXG4gICAgY29kZWZyYW1lUkUubGFzdEluZGV4ID0gMFxuICAgIGNvbnN0IGhhc0ZyYW1lID0gZXJyLmZyYW1lICYmIGNvZGVmcmFtZVJFLnRlc3QoZXJyLmZyYW1lKVxuICAgIGNvbnN0IG1lc3NhZ2UgPSBoYXNGcmFtZVxuICAgICAgPyBlcnIubWVzc2FnZS5yZXBsYWNlKGNvZGVmcmFtZVJFLCAnJylcbiAgICAgIDogZXJyLm1lc3NhZ2VcbiAgICBpZiAoZXJyLnBsdWdpbikge1xuICAgICAgdGhpcy50ZXh0KCcucGx1Z2luJywgYFtwbHVnaW46JHtlcnIucGx1Z2lufV0gYClcbiAgICB9XG4gICAgdGhpcy50ZXh0KCcubWVzc2FnZS1ib2R5JywgbWVzc2FnZS50cmltKCkpXG5cbiAgICBjb25zdCBbZmlsZV0gPSAoZXJyLmxvYz8uZmlsZSB8fCBlcnIuaWQgfHwgJ3Vua25vd24gZmlsZScpLnNwbGl0KGA/YClcbiAgICBpZiAoZXJyLmxvYykge1xuICAgICAgdGhpcy50ZXh0KCcuZmlsZScsIGAke2ZpbGV9OiR7ZXJyLmxvYy5saW5lfToke2Vyci5sb2MuY29sdW1ufWAsIHRydWUpXG4gICAgfSBlbHNlIGlmIChlcnIuaWQpIHtcbiAgICAgIHRoaXMudGV4dCgnLmZpbGUnLCBmaWxlKVxuICAgIH1cblxuICAgIGlmIChoYXNGcmFtZSkge1xuICAgICAgdGhpcy50ZXh0KCcuZnJhbWUnLCBlcnIuZnJhbWUhLnRyaW0oKSlcbiAgICB9XG4gICAgdGhpcy50ZXh0KCcuc3RhY2snLCBlcnIuc3RhY2ssIHRydWUpXG5cbiAgICB0aGlzLnJvb3QucXVlcnlTZWxlY3RvcignLndpbmRvdycpIS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgfSlcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgdGhpcy5jbG9zZSgpXG4gICAgfSlcbiAgfVxuXG4gIHRleHQoc2VsZWN0b3I6IHN0cmluZywgdGV4dDogc3RyaW5nLCBsaW5rRmlsZXMgPSBmYWxzZSk6IHZvaWQge1xuICAgIGNvbnN0IGVsID0gdGhpcy5yb290LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpIVxuICAgIGlmICghbGlua0ZpbGVzKSB7XG4gICAgICBlbC50ZXh0Q29udGVudCA9IHRleHRcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGN1ckluZGV4ID0gMFxuICAgICAgbGV0IG1hdGNoOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsXG4gICAgICB3aGlsZSAoKG1hdGNoID0gZmlsZVJFLmV4ZWModGV4dCkpKSB7XG4gICAgICAgIGNvbnN0IHsgMDogZmlsZSwgaW5kZXggfSA9IG1hdGNoXG4gICAgICAgIGlmIChpbmRleCAhPSBudWxsKSB7XG4gICAgICAgICAgY29uc3QgZnJhZyA9IHRleHQuc2xpY2UoY3VySW5kZXgsIGluZGV4KVxuICAgICAgICAgIGVsLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGZyYWcpKVxuICAgICAgICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcbiAgICAgICAgICBsaW5rLnRleHRDb250ZW50ID0gZmlsZVxuICAgICAgICAgIGxpbmsuY2xhc3NOYW1lID0gJ2ZpbGUtbGluaydcbiAgICAgICAgICBsaW5rLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBmZXRjaCgnL19fb3Blbi1pbi1lZGl0b3I/ZmlsZT0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGZpbGUpKVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbC5hcHBlbmRDaGlsZChsaW5rKVxuICAgICAgICAgIGN1ckluZGV4ICs9IGZyYWcubGVuZ3RoICsgZmlsZS5sZW5ndGhcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMucGFyZW50Tm9kZT8ucmVtb3ZlQ2hpbGQodGhpcylcbiAgfVxufVxuXG5leHBvcnQgY29uc3Qgb3ZlcmxheUlkID0gJ3ZpdGUtZXJyb3Itb3ZlcmxheSdcbmlmIChjdXN0b21FbGVtZW50cyAmJiAhY3VzdG9tRWxlbWVudHMuZ2V0KG92ZXJsYXlJZCkpIHtcbiAgY3VzdG9tRWxlbWVudHMuZGVmaW5lKG92ZXJsYXlJZCwgRXJyb3JPdmVybGF5KVxufVxuIiwiaW1wb3J0IHR5cGUgeyBFcnJvclBheWxvYWQsIEhNUlBheWxvYWQsIFVwZGF0ZSB9IGZyb20gJ3R5cGVzL2htclBheWxvYWQnXG5pbXBvcnQgdHlwZSB7IFZpdGVIb3RDb250ZXh0IH0gZnJvbSAndHlwZXMvaG90J1xuaW1wb3J0IHR5cGUgeyBJbmZlckN1c3RvbUV2ZW50UGF5bG9hZCB9IGZyb20gJ3R5cGVzL2N1c3RvbUV2ZW50J1xuaW1wb3J0IHsgRXJyb3JPdmVybGF5LCBvdmVybGF5SWQgfSBmcm9tICcuL292ZXJsYXknXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm9kZS9uby1taXNzaW5nLWltcG9ydFxuaW1wb3J0ICdAdml0ZS9lbnYnXG5cbi8vIGluamVjdGVkIGJ5IHRoZSBobXIgcGx1Z2luIHdoZW4gc2VydmVkXG5kZWNsYXJlIGNvbnN0IF9fQkFTRV9fOiBzdHJpbmdcbmRlY2xhcmUgY29uc3QgX19ITVJfUFJPVE9DT0xfXzogc3RyaW5nXG5kZWNsYXJlIGNvbnN0IF9fSE1SX0hPU1ROQU1FX186IHN0cmluZ1xuZGVjbGFyZSBjb25zdCBfX0hNUl9QT1JUX186IHN0cmluZ1xuZGVjbGFyZSBjb25zdCBfX0hNUl9USU1FT1VUX186IG51bWJlclxuZGVjbGFyZSBjb25zdCBfX0hNUl9FTkFCTEVfT1ZFUkxBWV9fOiBib29sZWFuXG5cbmNvbnNvbGUubG9nKCdbdml0ZV0gY29ubmVjdGluZy4uLicpXG5cbi8vIHVzZSBzZXJ2ZXIgY29uZmlndXJhdGlvbiwgdGhlbiBmYWxsYmFjayB0byBpbmZlcmVuY2VcbmNvbnN0IHNvY2tldFByb3RvY29sID1cbiAgX19ITVJfUFJPVE9DT0xfXyB8fCAobG9jYXRpb24ucHJvdG9jb2wgPT09ICdodHRwczonID8gJ3dzcycgOiAnd3MnKVxuY29uc3Qgc29ja2V0SG9zdCA9IGAke19fSE1SX0hPU1ROQU1FX18gfHwgbG9jYXRpb24uaG9zdG5hbWV9OiR7X19ITVJfUE9SVF9ffWBcbmNvbnN0IHNvY2tldCA9IG5ldyBXZWJTb2NrZXQoYCR7c29ja2V0UHJvdG9jb2x9Oi8vJHtzb2NrZXRIb3N0fWAsICd2aXRlLWhtcicpXG5jb25zdCBiYXNlID0gX19CQVNFX18gfHwgJy8nXG5jb25zdCBtZXNzYWdlQnVmZmVyOiBzdHJpbmdbXSA9IFtdXG5cbmZ1bmN0aW9uIHdhcm5GYWlsZWRGZXRjaChlcnI6IEVycm9yLCBwYXRoOiBzdHJpbmcgfCBzdHJpbmdbXSkge1xuICBpZiAoIWVyci5tZXNzYWdlLm1hdGNoKCdmZXRjaCcpKSB7XG4gICAgY29uc29sZS5lcnJvcihlcnIpXG4gIH1cbiAgY29uc29sZS5lcnJvcihcbiAgICBgW2htcl0gRmFpbGVkIHRvIHJlbG9hZCAke3BhdGh9LiBgICtcbiAgICAgIGBUaGlzIGNvdWxkIGJlIGR1ZSB0byBzeW50YXggZXJyb3JzIG9yIGltcG9ydGluZyBub24tZXhpc3RlbnQgYCArXG4gICAgICBgbW9kdWxlcy4gKHNlZSBlcnJvcnMgYWJvdmUpYFxuICApXG59XG5cbmZ1bmN0aW9uIGNsZWFuVXJsKHBhdGhuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCB1cmwgPSBuZXcgVVJMKHBhdGhuYW1lLCBsb2NhdGlvbi50b1N0cmluZygpKVxuICB1cmwuc2VhcmNoUGFyYW1zLmRlbGV0ZSgnZGlyZWN0JylcbiAgcmV0dXJuIHVybC5wYXRobmFtZSArIHVybC5zZWFyY2hcbn1cblxuLy8gTGlzdGVuIGZvciBtZXNzYWdlc1xuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBhc3luYyAoeyBkYXRhIH0pID0+IHtcbiAgaGFuZGxlTWVzc2FnZShKU09OLnBhcnNlKGRhdGEpKVxufSlcblxubGV0IGlzRmlyc3RVcGRhdGUgPSB0cnVlXG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2UocGF5bG9hZDogSE1SUGF5bG9hZCkge1xuICBzd2l0Y2ggKHBheWxvYWQudHlwZSkge1xuICAgIGNhc2UgJ2Nvbm5lY3RlZCc6XG4gICAgICBjb25zb2xlLmxvZyhgW3ZpdGVdIGNvbm5lY3RlZC5gKVxuICAgICAgc2VuZE1lc3NhZ2VCdWZmZXIoKVxuICAgICAgLy8gcHJveHkobmdpbngsIGRvY2tlcikgaG1yIHdzIG1heWJlIGNhdXNlZCB0aW1lb3V0LFxuICAgICAgLy8gc28gc2VuZCBwaW5nIHBhY2thZ2UgbGV0IHdzIGtlZXAgYWxpdmUuXG4gICAgICBzZXRJbnRlcnZhbCgoKSA9PiBzb2NrZXQuc2VuZCgne1widHlwZVwiOlwicGluZ1wifScpLCBfX0hNUl9USU1FT1VUX18pXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VwZGF0ZSc6XG4gICAgICBub3RpZnlMaXN0ZW5lcnMoJ3ZpdGU6YmVmb3JlVXBkYXRlJywgcGF5bG9hZClcbiAgICAgIC8vIGlmIHRoaXMgaXMgdGhlIGZpcnN0IHVwZGF0ZSBhbmQgdGhlcmUncyBhbHJlYWR5IGFuIGVycm9yIG92ZXJsYXksIGl0XG4gICAgICAvLyBtZWFucyB0aGUgcGFnZSBvcGVuZWQgd2l0aCBleGlzdGluZyBzZXJ2ZXIgY29tcGlsZSBlcnJvciBhbmQgdGhlIHdob2xlXG4gICAgICAvLyBtb2R1bGUgc2NyaXB0IGZhaWxlZCB0byBsb2FkIChzaW5jZSBvbmUgb2YgdGhlIG5lc3RlZCBpbXBvcnRzIGlzIDUwMCkuXG4gICAgICAvLyBpbiB0aGlzIGNhc2UgYSBub3JtYWwgdXBkYXRlIHdvbid0IHdvcmsgYW5kIGEgZnVsbCByZWxvYWQgaXMgbmVlZGVkLlxuICAgICAgaWYgKGlzRmlyc3RVcGRhdGUgJiYgaGFzRXJyb3JPdmVybGF5KCkpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICAgIHJldHVyblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2xlYXJFcnJvck92ZXJsYXkoKVxuICAgICAgICBpc0ZpcnN0VXBkYXRlID0gZmFsc2VcbiAgICAgIH1cbiAgICAgIHBheWxvYWQudXBkYXRlcy5mb3JFYWNoKCh1cGRhdGUpID0+IHtcbiAgICAgICAgaWYgKHVwZGF0ZS50eXBlID09PSAnanMtdXBkYXRlJykge1xuICAgICAgICAgIHF1ZXVlVXBkYXRlKGZldGNoVXBkYXRlKHVwZGF0ZSkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gY3NzLXVwZGF0ZVxuICAgICAgICAgIC8vIHRoaXMgaXMgb25seSBzZW50IHdoZW4gYSBjc3MgZmlsZSByZWZlcmVuY2VkIHdpdGggPGxpbms+IGlzIHVwZGF0ZWRcbiAgICAgICAgICBjb25zdCB7IHBhdGgsIHRpbWVzdGFtcCB9ID0gdXBkYXRlXG4gICAgICAgICAgY29uc3Qgc2VhcmNoVXJsID0gY2xlYW5VcmwocGF0aClcbiAgICAgICAgICAvLyBjYW4ndCB1c2UgcXVlcnlTZWxlY3RvciB3aXRoIGBbaHJlZio9XWAgaGVyZSBzaW5jZSB0aGUgbGluayBtYXkgYmVcbiAgICAgICAgICAvLyB1c2luZyByZWxhdGl2ZSBwYXRocyBzbyB3ZSBuZWVkIHRvIHVzZSBsaW5rLmhyZWYgdG8gZ3JhYiB0aGUgZnVsbFxuICAgICAgICAgIC8vIFVSTCBmb3IgdGhlIGluY2x1ZGUgY2hlY2suXG4gICAgICAgICAgY29uc3QgZWwgPSBBcnJheS5mcm9tKFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MTGlua0VsZW1lbnQ+KCdsaW5rJylcbiAgICAgICAgICApLmZpbmQoKGUpID0+IGNsZWFuVXJsKGUuaHJlZikuaW5jbHVkZXMoc2VhcmNoVXJsKSlcbiAgICAgICAgICBpZiAoZWwpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBgJHtiYXNlfSR7c2VhcmNoVXJsLnNsaWNlKDEpfSR7XG4gICAgICAgICAgICAgIHNlYXJjaFVybC5pbmNsdWRlcygnPycpID8gJyYnIDogJz8nXG4gICAgICAgICAgICB9dD0ke3RpbWVzdGFtcH1gXG5cbiAgICAgICAgICAgIC8vIHJhdGhlciB0aGFuIHN3YXBwaW5nIHRoZSBocmVmIG9uIHRoZSBleGlzdGluZyB0YWcsIHdlIHdpbGxcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIG5ldyBsaW5rIHRhZy4gT25jZSB0aGUgbmV3IHN0eWxlc2hlZXQgaGFzIGxvYWRlZCB3ZVxuICAgICAgICAgICAgLy8gd2lsbCByZW1vdmUgdGhlIGV4aXN0aW5nIGxpbmsgdGFnLiBUaGlzIHJlbW92ZXMgYSBGbGFzaCBPZlxuICAgICAgICAgICAgLy8gVW5zdHlsZWQgQ29udGVudCB0aGF0IGNhbiBvY2N1ciB3aGVuIHN3YXBwaW5nIG91dCB0aGUgdGFnIGhyZWZcbiAgICAgICAgICAgIC8vIGRpcmVjdGx5LCBhcyB0aGUgbmV3IHN0eWxlc2hlZXQgaGFzIG5vdCB5ZXQgYmVlbiBsb2FkZWQuXG4gICAgICAgICAgICBjb25zdCBuZXdMaW5rVGFnID0gZWwuY2xvbmVOb2RlKCkgYXMgSFRNTExpbmtFbGVtZW50XG4gICAgICAgICAgICBuZXdMaW5rVGFnLmhyZWYgPSBuZXcgVVJMKG5ld1BhdGgsIGVsLmhyZWYpLmhyZWZcbiAgICAgICAgICAgIGNvbnN0IHJlbW92ZU9sZEVsID0gKCkgPT4gZWwucmVtb3ZlKClcbiAgICAgICAgICAgIG5ld0xpbmtUYWcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJlbW92ZU9sZEVsKVxuICAgICAgICAgICAgbmV3TGlua1RhZy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHJlbW92ZU9sZEVsKVxuICAgICAgICAgICAgZWwuYWZ0ZXIobmV3TGlua1RhZylcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc29sZS5sb2coYFt2aXRlXSBjc3MgaG90IHVwZGF0ZWQ6ICR7c2VhcmNoVXJsfWApXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2N1c3RvbSc6IHtcbiAgICAgIG5vdGlmeUxpc3RlbmVycyhwYXlsb2FkLmV2ZW50LCBwYXlsb2FkLmRhdGEpXG4gICAgICBicmVha1xuICAgIH1cbiAgICBjYXNlICdmdWxsLXJlbG9hZCc6XG4gICAgICBub3RpZnlMaXN0ZW5lcnMoJ3ZpdGU6YmVmb3JlRnVsbFJlbG9hZCcsIHBheWxvYWQpXG4gICAgICBpZiAocGF5bG9hZC5wYXRoICYmIHBheWxvYWQucGF0aC5lbmRzV2l0aCgnLmh0bWwnKSkge1xuICAgICAgICAvLyBpZiBodG1sIGZpbGUgaXMgZWRpdGVkLCBvbmx5IHJlbG9hZCB0aGUgcGFnZSBpZiB0aGUgYnJvd3NlciBpc1xuICAgICAgICAvLyBjdXJyZW50bHkgb24gdGhhdCBwYWdlLlxuICAgICAgICBjb25zdCBwYWdlUGF0aCA9IGRlY29kZVVSSShsb2NhdGlvbi5wYXRobmFtZSlcbiAgICAgICAgY29uc3QgcGF5bG9hZFBhdGggPSBiYXNlICsgcGF5bG9hZC5wYXRoLnNsaWNlKDEpXG4gICAgICAgIGlmIChcbiAgICAgICAgICBwYWdlUGF0aCA9PT0gcGF5bG9hZFBhdGggfHxcbiAgICAgICAgICAocGFnZVBhdGguZW5kc1dpdGgoJy8nKSAmJiBwYWdlUGF0aCArICdpbmRleC5odG1sJyA9PT0gcGF5bG9hZFBhdGgpXG4gICAgICAgICkge1xuICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdwcnVuZSc6XG4gICAgICBub3RpZnlMaXN0ZW5lcnMoJ3ZpdGU6YmVmb3JlUHJ1bmUnLCBwYXlsb2FkKVxuICAgICAgLy8gQWZ0ZXIgYW4gSE1SIHVwZGF0ZSwgc29tZSBtb2R1bGVzIGFyZSBubyBsb25nZXIgaW1wb3J0ZWQgb24gdGhlIHBhZ2VcbiAgICAgIC8vIGJ1dCB0aGV5IG1heSBoYXZlIGxlZnQgYmVoaW5kIHNpZGUgZWZmZWN0cyB0aGF0IG5lZWQgdG8gYmUgY2xlYW5lZCB1cFxuICAgICAgLy8gKC5lLmcgc3R5bGUgaW5qZWN0aW9ucylcbiAgICAgIC8vIFRPRE8gVHJpZ2dlciB0aGVpciBkaXNwb3NlIGNhbGxiYWNrcy5cbiAgICAgIHBheWxvYWQucGF0aHMuZm9yRWFjaCgocGF0aCkgPT4ge1xuICAgICAgICBjb25zdCBmbiA9IHBydW5lTWFwLmdldChwYXRoKVxuICAgICAgICBpZiAoZm4pIHtcbiAgICAgICAgICBmbihkYXRhTWFwLmdldChwYXRoKSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnZXJyb3InOiB7XG4gICAgICBub3RpZnlMaXN0ZW5lcnMoJ3ZpdGU6ZXJyb3InLCBwYXlsb2FkKVxuICAgICAgY29uc3QgZXJyID0gcGF5bG9hZC5lcnJcbiAgICAgIGlmIChlbmFibGVPdmVybGF5KSB7XG4gICAgICAgIGNyZWF0ZUVycm9yT3ZlcmxheShlcnIpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgIGBbdml0ZV0gSW50ZXJuYWwgU2VydmVyIEVycm9yXFxuJHtlcnIubWVzc2FnZX1cXG4ke2Vyci5zdGFja31gXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgfVxuICAgIGRlZmF1bHQ6IHtcbiAgICAgIGNvbnN0IGNoZWNrOiBuZXZlciA9IHBheWxvYWRcbiAgICAgIHJldHVybiBjaGVja1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBub3RpZnlMaXN0ZW5lcnM8VCBleHRlbmRzIHN0cmluZz4oXG4gIGV2ZW50OiBULFxuICBkYXRhOiBJbmZlckN1c3RvbUV2ZW50UGF5bG9hZDxUPlxuKTogdm9pZFxuZnVuY3Rpb24gbm90aWZ5TGlzdGVuZXJzKGV2ZW50OiBzdHJpbmcsIGRhdGE6IGFueSk6IHZvaWQge1xuICBjb25zdCBjYnMgPSBjdXN0b21MaXN0ZW5lcnNNYXAuZ2V0KGV2ZW50KVxuICBpZiAoY2JzKSB7XG4gICAgY2JzLmZvckVhY2goKGNiKSA9PiBjYihkYXRhKSlcbiAgfVxufVxuXG5jb25zdCBlbmFibGVPdmVybGF5ID0gX19ITVJfRU5BQkxFX09WRVJMQVlfX1xuXG5mdW5jdGlvbiBjcmVhdGVFcnJvck92ZXJsYXkoZXJyOiBFcnJvclBheWxvYWRbJ2VyciddKSB7XG4gIGlmICghZW5hYmxlT3ZlcmxheSkgcmV0dXJuXG4gIGNsZWFyRXJyb3JPdmVybGF5KClcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChuZXcgRXJyb3JPdmVybGF5KGVycikpXG59XG5cbmZ1bmN0aW9uIGNsZWFyRXJyb3JPdmVybGF5KCkge1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yQWxsKG92ZXJsYXlJZClcbiAgICAuZm9yRWFjaCgobikgPT4gKG4gYXMgRXJyb3JPdmVybGF5KS5jbG9zZSgpKVxufVxuXG5mdW5jdGlvbiBoYXNFcnJvck92ZXJsYXkoKSB7XG4gIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKG92ZXJsYXlJZCkubGVuZ3RoXG59XG5cbmxldCBwZW5kaW5nID0gZmFsc2VcbmxldCBxdWV1ZWQ6IFByb21pc2U8KCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkPltdID0gW11cblxuLyoqXG4gKiBidWZmZXIgbXVsdGlwbGUgaG90IHVwZGF0ZXMgdHJpZ2dlcmVkIGJ5IHRoZSBzYW1lIHNyYyBjaGFuZ2VcbiAqIHNvIHRoYXQgdGhleSBhcmUgaW52b2tlZCBpbiB0aGUgc2FtZSBvcmRlciB0aGV5IHdlcmUgc2VudC5cbiAqIChvdGhlcndpc2UgdGhlIG9yZGVyIG1heSBiZSBpbmNvbnNpc3RlbnQgYmVjYXVzZSBvZiB0aGUgaHR0cCByZXF1ZXN0IHJvdW5kIHRyaXApXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHF1ZXVlVXBkYXRlKHA6IFByb21pc2U8KCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkPikge1xuICBxdWV1ZWQucHVzaChwKVxuICBpZiAoIXBlbmRpbmcpIHtcbiAgICBwZW5kaW5nID0gdHJ1ZVxuICAgIGF3YWl0IFByb21pc2UucmVzb2x2ZSgpXG4gICAgcGVuZGluZyA9IGZhbHNlXG4gICAgY29uc3QgbG9hZGluZyA9IFsuLi5xdWV1ZWRdXG4gICAgcXVldWVkID0gW11cbiAgICA7KGF3YWl0IFByb21pc2UuYWxsKGxvYWRpbmcpKS5mb3JFYWNoKChmbikgPT4gZm4gJiYgZm4oKSlcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiB3YWl0Rm9yU3VjY2Vzc2Z1bFBpbmcobXMgPSAxMDAwKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zdGFudC1jb25kaXRpb25cbiAgd2hpbGUgKHRydWUpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGluZ1Jlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7YmFzZX1fX3ZpdGVfcGluZ2ApXG5cbiAgICAgIC8vIHN1Y2Nlc3MgLSAyeHggc3RhdHVzIGNvZGVcbiAgICAgIGlmIChwaW5nUmVzcG9uc2Uub2spIGJyZWFrXG4gICAgICAvLyBmYWlsdXJlIC0gbm9uLTJ4eCBzdGF0dXMgY29kZVxuICAgICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IoKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIHdhaXQgbXMgYmVmb3JlIGF0dGVtcHRpbmcgdG8gcGluZyBhZ2FpblxuICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKVxuICAgIH1cbiAgfVxufVxuXG4vLyBwaW5nIHNlcnZlclxuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgYXN5bmMgKHsgd2FzQ2xlYW4gfSkgPT4ge1xuICBpZiAod2FzQ2xlYW4pIHJldHVyblxuICBjb25zb2xlLmxvZyhgW3ZpdGVdIHNlcnZlciBjb25uZWN0aW9uIGxvc3QuIHBvbGxpbmcgZm9yIHJlc3RhcnQuLi5gKVxuICBhd2FpdCB3YWl0Rm9yU3VjY2Vzc2Z1bFBpbmcoKVxuICBsb2NhdGlvbi5yZWxvYWQoKVxufSlcblxuLy8gaHR0cHM6Ly93aWNnLmdpdGh1Yi5pby9jb25zdHJ1Y3Qtc3R5bGVzaGVldHNcbmNvbnN0IHN1cHBvcnRzQ29uc3RydWN0ZWRTaGVldCA9ICgoKSA9PiB7XG4gIC8vIFRPRE86IHJlLWVuYWJsZSB0aGlzIHRyeSBibG9jayBvbmNlIENocm9tZSBmaXhlcyB0aGUgcGVyZm9ybWFuY2Ugb2ZcbiAgLy8gcnVsZSBpbnNlcnRpb24gaW4gcmVhbGx5IGJpZyBzdHlsZXNoZWV0c1xuICAvLyB0cnkge1xuICAvLyAgIG5ldyBDU1NTdHlsZVNoZWV0KClcbiAgLy8gICByZXR1cm4gdHJ1ZVxuICAvLyB9IGNhdGNoIChlKSB7fVxuICByZXR1cm4gZmFsc2Vcbn0pKClcblxuY29uc3Qgc2hlZXRzTWFwID0gbmV3IE1hcCgpXG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTdHlsZShpZDogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcpOiB2b2lkIHtcbiAgbGV0IHN0eWxlID0gc2hlZXRzTWFwLmdldChpZClcbiAgaWYgKHN1cHBvcnRzQ29uc3RydWN0ZWRTaGVldCAmJiAhY29udGVudC5pbmNsdWRlcygnQGltcG9ydCcpKSB7XG4gICAgaWYgKHN0eWxlICYmICEoc3R5bGUgaW5zdGFuY2VvZiBDU1NTdHlsZVNoZWV0KSkge1xuICAgICAgcmVtb3ZlU3R5bGUoaWQpXG4gICAgICBzdHlsZSA9IHVuZGVmaW5lZFxuICAgIH1cblxuICAgIGlmICghc3R5bGUpIHtcbiAgICAgIHN0eWxlID0gbmV3IENTU1N0eWxlU2hlZXQoKVxuICAgICAgc3R5bGUucmVwbGFjZVN5bmMoY29udGVudClcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3I6IHVzaW5nIGV4cGVyaW1lbnRhbCBBUElcbiAgICAgIGRvY3VtZW50LmFkb3B0ZWRTdHlsZVNoZWV0cyA9IFsuLi5kb2N1bWVudC5hZG9wdGVkU3R5bGVTaGVldHMsIHN0eWxlXVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHlsZS5yZXBsYWNlU3luYyhjb250ZW50KVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoc3R5bGUgJiYgIShzdHlsZSBpbnN0YW5jZW9mIEhUTUxTdHlsZUVsZW1lbnQpKSB7XG4gICAgICByZW1vdmVTdHlsZShpZClcbiAgICAgIHN0eWxlID0gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgaWYgKCFzdHlsZSkge1xuICAgICAgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgICBzdHlsZS5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndGV4dC9jc3MnKVxuICAgICAgc3R5bGUuaW5uZXJIVE1MID0gY29udGVudFxuICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSlcbiAgICB9IGVsc2Uge1xuICAgICAgc3R5bGUuaW5uZXJIVE1MID0gY29udGVudFxuICAgIH1cbiAgfVxuICBzaGVldHNNYXAuc2V0KGlkLCBzdHlsZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVN0eWxlKGlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3Qgc3R5bGUgPSBzaGVldHNNYXAuZ2V0KGlkKVxuICBpZiAoc3R5bGUpIHtcbiAgICBpZiAoc3R5bGUgaW5zdGFuY2VvZiBDU1NTdHlsZVNoZWV0KSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yOiB1c2luZyBleHBlcmltZW50YWwgQVBJXG4gICAgICBkb2N1bWVudC5hZG9wdGVkU3R5bGVTaGVldHMgPSBkb2N1bWVudC5hZG9wdGVkU3R5bGVTaGVldHMuZmlsdGVyKFxuICAgICAgICAoczogQ1NTU3R5bGVTaGVldCkgPT4gcyAhPT0gc3R5bGVcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgZG9jdW1lbnQuaGVhZC5yZW1vdmVDaGlsZChzdHlsZSlcbiAgICB9XG4gICAgc2hlZXRzTWFwLmRlbGV0ZShpZClcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBmZXRjaFVwZGF0ZSh7IHBhdGgsIGFjY2VwdGVkUGF0aCwgdGltZXN0YW1wIH06IFVwZGF0ZSkge1xuICBjb25zdCBtb2QgPSBob3RNb2R1bGVzTWFwLmdldChwYXRoKVxuICBpZiAoIW1vZCkge1xuICAgIC8vIEluIGEgY29kZS1zcGxpdHRpbmcgcHJvamVjdCxcbiAgICAvLyBpdCBpcyBjb21tb24gdGhhdCB0aGUgaG90LXVwZGF0aW5nIG1vZHVsZSBpcyBub3QgbG9hZGVkIHlldC5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdml0ZWpzL3ZpdGUvaXNzdWVzLzcyMVxuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3QgbW9kdWxlTWFwID0gbmV3IE1hcCgpXG4gIGNvbnN0IGlzU2VsZlVwZGF0ZSA9IHBhdGggPT09IGFjY2VwdGVkUGF0aFxuXG4gIC8vIG1ha2Ugc3VyZSB3ZSBvbmx5IGltcG9ydCBlYWNoIGRlcCBvbmNlXG4gIGNvbnN0IG1vZHVsZXNUb1VwZGF0ZSA9IG5ldyBTZXQ8c3RyaW5nPigpXG4gIGlmIChpc1NlbGZVcGRhdGUpIHtcbiAgICAvLyBzZWxmIHVwZGF0ZSAtIG9ubHkgdXBkYXRlIHNlbGZcbiAgICBtb2R1bGVzVG9VcGRhdGUuYWRkKHBhdGgpXG4gIH0gZWxzZSB7XG4gICAgLy8gZGVwIHVwZGF0ZVxuICAgIGZvciAoY29uc3QgeyBkZXBzIH0gb2YgbW9kLmNhbGxiYWNrcykge1xuICAgICAgZGVwcy5mb3JFYWNoKChkZXApID0+IHtcbiAgICAgICAgaWYgKGFjY2VwdGVkUGF0aCA9PT0gZGVwKSB7XG4gICAgICAgICAgbW9kdWxlc1RvVXBkYXRlLmFkZChkZXApXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgLy8gZGV0ZXJtaW5lIHRoZSBxdWFsaWZpZWQgY2FsbGJhY2tzIGJlZm9yZSB3ZSByZS1pbXBvcnQgdGhlIG1vZHVsZXNcbiAgY29uc3QgcXVhbGlmaWVkQ2FsbGJhY2tzID0gbW9kLmNhbGxiYWNrcy5maWx0ZXIoKHsgZGVwcyB9KSA9PiB7XG4gICAgcmV0dXJuIGRlcHMuc29tZSgoZGVwKSA9PiBtb2R1bGVzVG9VcGRhdGUuaGFzKGRlcCkpXG4gIH0pXG5cbiAgYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgQXJyYXkuZnJvbShtb2R1bGVzVG9VcGRhdGUpLm1hcChhc3luYyAoZGVwKSA9PiB7XG4gICAgICBjb25zdCBkaXNwb3NlciA9IGRpc3Bvc2VNYXAuZ2V0KGRlcClcbiAgICAgIGlmIChkaXNwb3NlcikgYXdhaXQgZGlzcG9zZXIoZGF0YU1hcC5nZXQoZGVwKSlcbiAgICAgIGNvbnN0IFtwYXRoLCBxdWVyeV0gPSBkZXAuc3BsaXQoYD9gKVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbmV3TW9kID0gYXdhaXQgaW1wb3J0KFxuICAgICAgICAgIC8qIEB2aXRlLWlnbm9yZSAqL1xuICAgICAgICAgIGJhc2UgK1xuICAgICAgICAgICAgcGF0aC5zbGljZSgxKSArXG4gICAgICAgICAgICBgP2ltcG9ydCZ0PSR7dGltZXN0YW1wfSR7cXVlcnkgPyBgJiR7cXVlcnl9YCA6ICcnfWBcbiAgICAgICAgKVxuICAgICAgICBtb2R1bGVNYXAuc2V0KGRlcCwgbmV3TW9kKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB3YXJuRmFpbGVkRmV0Y2goZSwgZGVwKVxuICAgICAgfVxuICAgIH0pXG4gIClcblxuICByZXR1cm4gKCkgPT4ge1xuICAgIGZvciAoY29uc3QgeyBkZXBzLCBmbiB9IG9mIHF1YWxpZmllZENhbGxiYWNrcykge1xuICAgICAgZm4oZGVwcy5tYXAoKGRlcCkgPT4gbW9kdWxlTWFwLmdldChkZXApKSlcbiAgICB9XG4gICAgY29uc3QgbG9nZ2VkUGF0aCA9IGlzU2VsZlVwZGF0ZSA/IHBhdGggOiBgJHthY2NlcHRlZFBhdGh9IHZpYSAke3BhdGh9YFxuICAgIGNvbnNvbGUubG9nKGBbdml0ZV0gaG90IHVwZGF0ZWQ6ICR7bG9nZ2VkUGF0aH1gKVxuICB9XG59XG5cbmZ1bmN0aW9uIHNlbmRNZXNzYWdlQnVmZmVyKCkge1xuICBpZiAoc29ja2V0LnJlYWR5U3RhdGUgPT09IDEpIHtcbiAgICBtZXNzYWdlQnVmZmVyLmZvckVhY2goKG1zZykgPT4gc29ja2V0LnNlbmQobXNnKSlcbiAgICBtZXNzYWdlQnVmZmVyLmxlbmd0aCA9IDBcbiAgfVxufVxuXG5pbnRlcmZhY2UgSG90TW9kdWxlIHtcbiAgaWQ6IHN0cmluZ1xuICBjYWxsYmFja3M6IEhvdENhbGxiYWNrW11cbn1cblxuaW50ZXJmYWNlIEhvdENhbGxiYWNrIHtcbiAgLy8gdGhlIGRlcGVuZGVuY2llcyBtdXN0IGJlIGZldGNoYWJsZSBwYXRoc1xuICBkZXBzOiBzdHJpbmdbXVxuICBmbjogKG1vZHVsZXM6IG9iamVjdFtdKSA9PiB2b2lkXG59XG5cbmNvbnN0IGhvdE1vZHVsZXNNYXAgPSBuZXcgTWFwPHN0cmluZywgSG90TW9kdWxlPigpXG5jb25zdCBkaXNwb3NlTWFwID0gbmV3IE1hcDxzdHJpbmcsIChkYXRhOiBhbnkpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+PigpXG5jb25zdCBwcnVuZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCAoZGF0YTogYW55KSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPj4oKVxuY29uc3QgZGF0YU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBhbnk+KClcbmNvbnN0IGN1c3RvbUxpc3RlbmVyc01hcCA9IG5ldyBNYXA8c3RyaW5nLCAoKGRhdGE6IGFueSkgPT4gdm9pZClbXT4oKVxuY29uc3QgY3R4VG9MaXN0ZW5lcnNNYXAgPSBuZXcgTWFwPFxuICBzdHJpbmcsXG4gIE1hcDxzdHJpbmcsICgoZGF0YTogYW55KSA9PiB2b2lkKVtdPlxuPigpXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVIb3RDb250ZXh0KG93bmVyUGF0aDogc3RyaW5nKTogVml0ZUhvdENvbnRleHQge1xuICBpZiAoIWRhdGFNYXAuaGFzKG93bmVyUGF0aCkpIHtcbiAgICBkYXRhTWFwLnNldChvd25lclBhdGgsIHt9KVxuICB9XG5cbiAgLy8gd2hlbiBhIGZpbGUgaXMgaG90IHVwZGF0ZWQsIGEgbmV3IGNvbnRleHQgaXMgY3JlYXRlZFxuICAvLyBjbGVhciBpdHMgc3RhbGUgY2FsbGJhY2tzXG4gIGNvbnN0IG1vZCA9IGhvdE1vZHVsZXNNYXAuZ2V0KG93bmVyUGF0aClcbiAgaWYgKG1vZCkge1xuICAgIG1vZC5jYWxsYmFja3MgPSBbXVxuICB9XG5cbiAgLy8gY2xlYXIgc3RhbGUgY3VzdG9tIGV2ZW50IGxpc3RlbmVyc1xuICBjb25zdCBzdGFsZUxpc3RlbmVycyA9IGN0eFRvTGlzdGVuZXJzTWFwLmdldChvd25lclBhdGgpXG4gIGlmIChzdGFsZUxpc3RlbmVycykge1xuICAgIGZvciAoY29uc3QgW2V2ZW50LCBzdGFsZUZuc10gb2Ygc3RhbGVMaXN0ZW5lcnMpIHtcbiAgICAgIGNvbnN0IGxpc3RlbmVycyA9IGN1c3RvbUxpc3RlbmVyc01hcC5nZXQoZXZlbnQpXG4gICAgICBpZiAobGlzdGVuZXJzKSB7XG4gICAgICAgIGN1c3RvbUxpc3RlbmVyc01hcC5zZXQoXG4gICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgbGlzdGVuZXJzLmZpbHRlcigobCkgPT4gIXN0YWxlRm5zLmluY2x1ZGVzKGwpKVxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3QgbmV3TGlzdGVuZXJzID0gbmV3IE1hcCgpXG4gIGN0eFRvTGlzdGVuZXJzTWFwLnNldChvd25lclBhdGgsIG5ld0xpc3RlbmVycylcblxuICBmdW5jdGlvbiBhY2NlcHREZXBzKGRlcHM6IHN0cmluZ1tdLCBjYWxsYmFjazogSG90Q2FsbGJhY2tbJ2ZuJ10gPSAoKSA9PiB7fSkge1xuICAgIGNvbnN0IG1vZDogSG90TW9kdWxlID0gaG90TW9kdWxlc01hcC5nZXQob3duZXJQYXRoKSB8fCB7XG4gICAgICBpZDogb3duZXJQYXRoLFxuICAgICAgY2FsbGJhY2tzOiBbXVxuICAgIH1cbiAgICBtb2QuY2FsbGJhY2tzLnB1c2goe1xuICAgICAgZGVwcyxcbiAgICAgIGZuOiBjYWxsYmFja1xuICAgIH0pXG4gICAgaG90TW9kdWxlc01hcC5zZXQob3duZXJQYXRoLCBtb2QpXG4gIH1cblxuICBjb25zdCBob3Q6IFZpdGVIb3RDb250ZXh0ID0ge1xuICAgIGdldCBkYXRhKCkge1xuICAgICAgcmV0dXJuIGRhdGFNYXAuZ2V0KG93bmVyUGF0aClcbiAgICB9LFxuXG4gICAgYWNjZXB0KGRlcHM/OiBhbnksIGNhbGxiYWNrPzogYW55KSB7XG4gICAgICBpZiAodHlwZW9mIGRlcHMgPT09ICdmdW5jdGlvbicgfHwgIWRlcHMpIHtcbiAgICAgICAgLy8gc2VsZi1hY2NlcHQ6IGhvdC5hY2NlcHQoKCkgPT4ge30pXG4gICAgICAgIGFjY2VwdERlcHMoW293bmVyUGF0aF0sIChbbW9kXSkgPT4gZGVwcyAmJiBkZXBzKG1vZCkpXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZXBzID09PSAnc3RyaW5nJykge1xuICAgICAgICAvLyBleHBsaWNpdCBkZXBzXG4gICAgICAgIGFjY2VwdERlcHMoW2RlcHNdLCAoW21vZF0pID0+IGNhbGxiYWNrICYmIGNhbGxiYWNrKG1vZCkpXG4gICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZGVwcykpIHtcbiAgICAgICAgYWNjZXB0RGVwcyhkZXBzLCBjYWxsYmFjaylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBob3QuYWNjZXB0KCkgdXNhZ2UuYClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWNjZXB0RGVwcygpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYGhvdC5hY2NlcHREZXBzKCkgaXMgZGVwcmVjYXRlZC4gYCArXG4gICAgICAgICAgYFVzZSBob3QuYWNjZXB0KCkgd2l0aCB0aGUgc2FtZSBzaWduYXR1cmUgaW5zdGVhZC5gXG4gICAgICApXG4gICAgfSxcblxuICAgIGRpc3Bvc2UoY2IpIHtcbiAgICAgIGRpc3Bvc2VNYXAuc2V0KG93bmVyUGF0aCwgY2IpXG4gICAgfSxcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdW50eXBlZFxuICAgIHBydW5lKGNiOiAoZGF0YTogYW55KSA9PiB2b2lkKSB7XG4gICAgICBwcnVuZU1hcC5zZXQob3duZXJQYXRoLCBjYilcbiAgICB9LFxuXG4gICAgLy8gVE9ET1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZW1wdHktZnVuY3Rpb25cbiAgICBkZWNsaW5lKCkge30sXG5cbiAgICBpbnZhbGlkYXRlKCkge1xuICAgICAgLy8gVE9ETyBzaG91bGQgdGVsbCB0aGUgc2VydmVyIHRvIHJlLXBlcmZvcm0gaG1yIHByb3BhZ2F0aW9uXG4gICAgICAvLyBmcm9tIHRoaXMgbW9kdWxlIGFzIHJvb3RcbiAgICAgIGxvY2F0aW9uLnJlbG9hZCgpXG4gICAgfSxcblxuICAgIC8vIGN1c3RvbSBldmVudHNcbiAgICBvbihldmVudCwgY2IpIHtcbiAgICAgIGNvbnN0IGFkZFRvTWFwID0gKG1hcDogTWFwPHN0cmluZywgYW55W10+KSA9PiB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nID0gbWFwLmdldChldmVudCkgfHwgW11cbiAgICAgICAgZXhpc3RpbmcucHVzaChjYilcbiAgICAgICAgbWFwLnNldChldmVudCwgZXhpc3RpbmcpXG4gICAgICB9XG4gICAgICBhZGRUb01hcChjdXN0b21MaXN0ZW5lcnNNYXApXG4gICAgICBhZGRUb01hcChuZXdMaXN0ZW5lcnMpXG4gICAgfSxcblxuICAgIHNlbmQoZXZlbnQsIGRhdGEpIHtcbiAgICAgIG1lc3NhZ2VCdWZmZXIucHVzaChKU09OLnN0cmluZ2lmeSh7IHR5cGU6ICdjdXN0b20nLCBldmVudCwgZGF0YSB9KSlcbiAgICAgIHNlbmRNZXNzYWdlQnVmZmVyKClcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaG90XG59XG5cbi8qKlxuICogdXJscyBoZXJlIGFyZSBkeW5hbWljIGltcG9ydCgpIHVybHMgdGhhdCBjb3VsZG4ndCBiZSBzdGF0aWNhbGx5IGFuYWx5emVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmplY3RRdWVyeSh1cmw6IHN0cmluZywgcXVlcnlUb0luamVjdDogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gc2tpcCB1cmxzIHRoYXQgd29uJ3QgYmUgaGFuZGxlZCBieSB2aXRlXG4gIGlmICghdXJsLnN0YXJ0c1dpdGgoJy4nKSAmJiAhdXJsLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgIHJldHVybiB1cmxcbiAgfVxuXG4gIC8vIGNhbid0IHVzZSBwYXRobmFtZSBmcm9tIFVSTCBzaW5jZSBpdCBtYXkgYmUgcmVsYXRpdmUgbGlrZSAuLi9cbiAgY29uc3QgcGF0aG5hbWUgPSB1cmwucmVwbGFjZSgvIy4qJC8sICcnKS5yZXBsYWNlKC9cXD8uKiQvLCAnJylcbiAgY29uc3QgeyBzZWFyY2gsIGhhc2ggfSA9IG5ldyBVUkwodXJsLCAnaHR0cDovL3ZpdGVqcy5kZXYnKVxuXG4gIHJldHVybiBgJHtwYXRobmFtZX0/JHtxdWVyeVRvSW5qZWN0fSR7c2VhcmNoID8gYCZgICsgc2VhcmNoLnNsaWNlKDEpIDogJyd9JHtcbiAgICBoYXNoIHx8ICcnXG4gIH1gXG59XG5cbmV4cG9ydCB7IEVycm9yT3ZlcmxheSB9XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxNQUFNLFFBQVEsWUFBWTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E4R3pCLENBQUE7QUFFRCxNQUFNLE1BQU0sR0FBRyxnQ0FBZ0MsQ0FBQTtBQUMvQyxNQUFNLFdBQVcsR0FBRywwQ0FBMEMsQ0FBQTtNQUVqRCxZQUFhLFNBQVEsV0FBVztJQUczQyxZQUFZLEdBQXdCOztRQUNsQyxLQUFLLEVBQUUsQ0FBQTtRQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFBO1FBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQTtRQUU5QixXQUFXLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQTtRQUN6QixNQUFNLFFBQVEsR0FBRyxHQUFHLENB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