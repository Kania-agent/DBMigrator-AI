/* DBMigrator-AI — App Logic */
document.addEventListener('DOMContentLoaded', () => {
    // Tab navigation
    const tabs = document.querySelectorAll('.nav-tab');
    const panels = document.querySelectorAll('.tab-panel');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // Schema Data
    const sourceSchema = [
        {
            name: 'users',
            columns: [
                { name: 'id', type: 'INT', key: 'PK' },
                { name: 'email', type: 'VARCHAR(255)', key: '' },
                { name: 'name', type: 'VARCHAR(100)', key: '' },
                { name: 'created_at', type: 'TIMESTAMP', key: '' }
            ]
        },
        {
            name: 'orders',
            columns: [
                { name: 'id', type: 'INT', key: 'PK' },
                { name: 'user_id', type: 'INT', key: 'FK' },
                { name: 'total', type: 'DECIMAL(10,2)', key: '' },
                { name: 'status', type: 'VARCHAR(20)', key: '' }
            ]
        },
        {
            name: 'products',
            columns: [
                { name: 'id', type: 'INT', key: 'PK' },
                { name: 'name', type: 'VARCHAR(200)', key: '' },
                { name: 'price', type: 'DECIMAL(10,2)', key: '' }
            ]
        },
        {
            name: 'sessions',
            columns: [
                { name: 'id', type: 'INT', key: 'PK' },
                { name: 'token', type: 'VARCHAR(64)', key: '' }
            ]
        }
    ];

    const targetSchema = [
        {
            name: 'users',
            columns: [
                { name: 'id', type: 'INT', key: 'PK' },
                { name: 'email', type: 'VARCHAR(255)', key: '' },
                { name: 'name', type: 'VARCHAR(150)', key: '', modified: true },
                { name: 'avatar_url', type: 'TEXT', key: '', added: true },
                { name: 'created_at', type: 'TIMESTAMP', key: '' }
            ]
        },
        {
            name: 'orders',
            columns: [
                { name: 'id', type: 'INT', key: 'PK' },
                { name: 'user_id', type: 'INT', key: 'FK' },
                { name: 'total', type: 'DECIMAL(12,2)', key: '', modified: true },
                { name: 'status', type: 'VARCHAR(30)', key: '', modified: true },
                { name: 'created_at', type: 'TIMESTAMP', key: '', added: true }
            ]
        },
        {
            name: 'products',
            columns: [
                { name: 'id', type: 'INT', key: 'PK' },
                { name: 'name', type: 'VARCHAR(200)', key: '' },
                { name: 'price', type: 'DECIMAL(10,2)', key: '' },
                { name: 'sku', type: 'VARCHAR(50)', key: '', added: true }
            ]
        },
        {
            name: 'sessions',
            columns: [
                { name: 'id', type: 'INT', key: 'PK' },
                { name: 'token', type: 'VARCHAR(64)', key: '' }
            ]
        },
        {
            name: 'analytics',
            columns: [
                { name: 'id', type: 'BIGINT', key: 'PK' },
                { name: 'event_type', type: 'VARCHAR(50)', key: '' },
                { name: 'payload', type: 'JSONB', key: '' },
                { name: 'created_at', type: 'TIMESTAMP', key: '' }
            ],
            added: true
        },
        {
            name: 'audit_log',
            columns: [
                { name: 'id', type: 'BIGINT', key: 'PK' },
                { name: 'action', type: 'VARCHAR(100)', key: '' },
                { name: 'actor_id', type: 'INT', key: 'FK' },
                { name: 'details', type: 'JSONB', key: '' },
                { name: 'created_at', type: 'TIMESTAMP', key: '' }
            ],
            added: true
        }
    ];

    function renderSchemaTree(containerId, tables) {
        const container = document.getElementById(containerId);
        container.innerHTML = tables.map(t => {
            const addedClass = t.added ? ' style="color: var(--accent-green);"' : '';
            const label = t.added ? ' <span style="color:var(--accent-green);font-size:10px;">[NEW]</span>' : '';
            const colsHtml = t.columns.map(c => {
                let cls = 'tree-col';
                if (c.key === 'PK') cls += ' pkey';
                if (c.added) cls += ' added';
                if (c.modified) cls += ' modified';
                const modMark = c.added ? ' [+]' : c.modified ? ' [~]' : '';
                return `<div class="${cls}">${c.name}: ${c.type}${c.key ? ' — ' + c.key : ''}${modMark}</div>`;
            }).join('');
            return `<div class="tree-table"><div class="tree-table-name"${addedClass}>◆ ${t.name}${label}</div>${colsHtml}</div>`;
        }).join('');
    }

    renderSchemaTree('source-tree', sourceSchema);
    renderSchemaTree('target-tree', targetSchema);

    // Migrations Data
    const migrations = [
        { id: 'V025', name: 'add_analytics_table', status: 'completed', date: '2026-05-24 07:12', duration: '1.2s' },
        { id: 'V024', name: 'add_audit_log_table', status: 'completed', date: '2026-05-24 07:11', duration: '0.8s' },
        { id: 'V023', name: 'extend_user_avatar', status: 'completed', date: '2026-05-24 07:10', duration: '2.4s' },
        { id: 'V022', name: 'update_order_fields', status: 'pending', date: '—', duration: '—' },
        { id: 'V021', name: 'add_product_sku', status: 'pending', date: '—', duration: '—' },
        { id: 'V020', name: 'index_user_email', status: 'pending', date: '—', duration: '—' },
        { id: 'V019', name: 'optimize_session_lookup', status: 'running', date: '2026-05-24 07:13', duration: '...' },
    ];

    function renderMigrations() {
        const list = document.getElementById('migration-list');
        list.innerHTML = migrations.map(m => `
            <div class="migration-item ${m.status}">
                <span class="mig-id">${m.id}</span>
                <span class="mig-name">${m.name}</span>
                <span class="mig-date">${m.date}</span>
                <span class="mig-status ${m.status}">${m.status.charAt(0).toUpperCase() + m.status.slice(1)}</span>
                <span class="mig-duration">${m.duration}</span>
            </div>
        `).join('');
    }

    renderMigrations();

    // Execution Log
    const logEntries = [
        { time: '07:10:01.234', level: 'info', msg: '[MigrationRunner] Starting migration V019: optimize_session_lookup' },
        { time: '07:10:01.456', level: 'sql', msg: 'CREATE INDEX idx_session_token ON sessions USING btree(token);' },
        { time: '07:10:02.112', level: 'info', msg: '[MigrationRunner] Index created successfully (1.1s)' },
        { time: '07:10:02.234', level: 'sql', msg: 'ALTER TABLE users ADD COLUMN avatar_url TEXT;' },
        { time: '07:10:02.567', level: 'info', msg: '[MigrationRunner] Column added to users table' },
        { time: '07:10:03.001', level: 'sql', msg: 'ALTER TABLE users ALTER COLUMN name TYPE VARCHAR(150);' },
        { time: '07:10:03.234', level: 'warn', msg: '[MigrationRunner] Column type change detected — ALTER may lock table on large datasets' },
        { time: '07:10:03.567', level: 'sql', msg: 'ALTER TABLE orders ALTER COLUMN total TYPE DECIMAL(12,2);' },
        { time: '07:10:04.001', level: 'success', msg: '[MigrationRunner] V019 completed successfully — total time: 2.8s' },
        { time: '07:10:04.123', level: 'info', msg: '[MigrationRunner] Starting migration V020: index_user_email' },
        { time: '07:10:04.345', level: 'sql', msg: 'CREATE UNIQUE INDEX idx_user_email ON users(email);' },
        { time: '07:10:04.678', level: 'success', msg: '[MigrationRunner] V020 completed successfully — total time: 0.6s' },
    ];

    const logOutput = document.getElementById('log-output');
    let logIndex = 0;

    function renderLogEntry(entry) {
        const line = document.createElement('div');
        line.className = 'log-line';
        line.innerHTML = `<span class="log-time">[${entry.time}]</span> <span class="log-${entry.level}">${entry.msg}</span>`;
        logOutput.appendChild(line);
    }

    function addNextLog() {
        if (logIndex < logEntries.length) {
            renderLogEntry(logEntries[logIndex]);
            logIndex++;
            if (document.getElementById('auto-scroll').checked) {
                logOutput.scrollTop = logOutput.scrollHeight;
            }
        }
    }

    // Initial log entries
    logEntries.slice(0, 6).forEach(e => renderLogEntry(e));
    logIndex = 6;

    // Add remaining log entries with delay
    setInterval(addNextLog, 1500);

    // Clear log
    document.getElementById('clear-log-btn').addEventListener('click', () => {
        logOutput.innerHTML = '';
        logIndex = 0;
    });

    // Export log
    document.getElementById('export-log-btn').addEventListener('click', () => {
        const text = logOutput.innerText;
        const blob = new Blob([text], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'migration-log.txt';
        a.click();
    });

    // Run migration button
    document.getElementById('run-migration-btn').addEventListener('click', () => {
        const pending = migrations.filter(m => m.status === 'pending');
        if (pending.length === 0) return;
        const next = pending[0];
        next.status = 'running';
        next.date = new Date().toISOString().slice(0, 19).replace('T', ' ').slice(11);
        next.duration = '...';
        renderMigrations();
        renderLogEntry({ time: new Date().toISOString().slice(11, 23), level: 'info', msg: `[MigrationRunner] Starting migration ${next.id}: ${next.name}` });

        setTimeout(() => {
            next.status = 'completed';
            next.duration = (Math.random() * 3 + 0.5).toFixed(1) + 's';
            renderMigrations();
            renderLogEntry({ time: new Date().toISOString().slice(11, 23), level: 'success', msg: `[MigrationRunner] ${next.id} completed successfully — total time: ${next.duration}` });
            logOutput.scrollTop = logOutput.scrollHeight;
        }, 2500);
    });

    // Compare button animation
    document.getElementById('compare-btn').addEventListener('click', () => {
        const btn = document.getElementById('compare-btn');
        btn.textContent = 'Comparing...';
        setTimeout(() => { btn.textContent = 'Compare Schemas'; }, 1500);
    });
});
