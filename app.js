// DBMigrator-AI — Full Database Migration Tool
// ============================================================

let sourceSchema = {};
let targetSchema = {};
let currentMigration = null;
let migrationHistory = JSON.parse(localStorage.getItem('dbmig_history') || '[]');
let editingContext = null; // {side:'source'|'target', tableName, colIndex}

// ---- Initialization ----
document.addEventListener('DOMContentLoaded', () => {
  renderSchema('source');
  renderSchema('target');
});

// ---- Tab Management ----
function switchTab(name) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  event.target.classList.add('active');
}

// ---- Schema Management ----
function addSourceTable() {
  const input = document.getElementById('srcNewTable');
  const name = input.value.trim();
  if (!name) return;
  if (sourceSchema[name]) { alert('Table already exists'); return; }
  sourceSchema[name] = [];
  input.value = '';
  renderSchema('source');
}

function addTargetTable() {
  const input = document.getElementById('tgtNewTable');
  const name = input.value.trim();
  if (!name) return;
  if (targetSchema[name]) { alert('Table already exists'); return; }
  targetSchema[name] = [];
  input.value = '';
  renderSchema('target');
}

function removeTable(side, tableName) {
  if (!confirm(`Remove table "${tableName}"?`)) return;
  if (side === 'source') delete sourceSchema[tableName];
  else delete targetSchema[tableName];
  renderSchema(side);
}

function renderSchema(side) {
  const schema = side === 'source' ? sourceSchema : targetSchema;
  const container = document.getElementById(side === 'source' ? 'sourceTables' : 'targetTables');
  container.innerHTML = '';
  const tables = Object.keys(schema);
  if (tables.length === 0) {
    container.innerHTML = '<p class="placeholder" style="padding:30px">No tables defined. Add one below.</p>';
    return;
  }
  tables.forEach(tableName => {
    const cols = schema[tableName];
    const block = document.createElement('div');
    block.className = 'table-block';
    let colsHtml = '';
    if (cols.length > 0) {
      colsHtml = '<div class="table-columns">' + cols.map((c, i) => {
        let badges = '';
        if (c.primaryKey) badges += '<span class="badge badge-pk">PK</span>';
        if (c.notNull) badges += '<span class="badge badge-nn">NN</span>';
        if (c.unique) badges += '<span class="badge badge-uq">UQ</span>';
        return `<div class="col-row">
          <span class="col-name">${esc(c.name)}</span>
          <span class="col-type">${esc(c.type)}</span>
          <span class="col-badges">${badges}</span>
          <div class="col-actions">
            <button onclick="openEditColumn('${side}','${esc(tableName)}',${i})" title="Edit">✏️</button>
            <button onclick="removeColumn('${side}','${esc(tableName)}',${i})" title="Remove">🗑️</button>
          </div>
        </div>`;
      }).join('') + '</div>';
    } else {
      colsHtml = '<div class="table-columns"><p class="placeholder" style="padding:10px">No columns. Click + to add.</p></div>';
    }
    block.innerHTML = `
      <div class="table-block-header">
        <span class="table-name">📋 ${esc(tableName)}</span>
        <div class="table-actions">
          <button class="btn btn-small" onclick="openAddColumn('${side}','${esc(tableName)}')">+ Column</button>
          <button class="btn btn-small btn-danger" onclick="removeTable('${side}','${esc(tableName)}')">✕</button>
        </div>
      </div>
      ${colsHtml}`;
    container.appendChild(block);
  });
}

function openAddColumn(side, tableName) {
  editingContext = { side, tableName, colIndex: -1 };
  document.getElementById('columnModalTitle').textContent = `Add Column to ${tableName}`;
  document.getElementById('colName').value = '';
  document.getElementById('colType').value = 'INT';
  document.getElementById('colPK').checked = false;
  document.getElementById('colNN').checked = false;
  document.getElementById('colUQ').checked = false;
  document.getElementById('colAI').checked = false;
  document.getElementById('colDefault').value = '';
  document.getElementById('columnModal').style.display = 'flex';
}

function openEditColumn(side, tableName, colIndex) {
  const col = (side === 'source' ? sourceSchema : targetSchema)[tableName][colIndex];
  editingContext = { side, tableName, colIndex };
  document.getElementById('columnModalTitle').textContent = `Edit Column: ${col.name}`;
  document.getElementById('colName').value = col.name;
  document.getElementById('colType').value = col.type;
  document.getElementById('colPK').checked = col.primaryKey || false;
  document.getElementById('colNN').checked = col.notNull || false;
  document.getElementById('colUQ').checked = col.unique || false;
  document.getElementById('colAI').checked = col.autoIncrement || false;
  document.getElementById('colDefault').value = col.defaultVal || '';
  document.getElementById('columnModal').style.display = 'flex';
}

function saveColumn() {
  if (!editingContext) return;
  const name = document.getElementById('colName').value.trim();
  if (!name) { alert('Column name required'); return; }
  const col = {
    name,
    type: document.getElementById('colType').value,
    primaryKey: document.getElementById('colPK').checked,
    notNull: document.getElementById('colNN').checked,
    unique: document.getElementById('colUQ').checked,
    autoIncrement: document.getElementById('colAI').checked,
    defaultVal: document.getElementById('colDefault').value.trim()
  };
  const schema = editingContext.side === 'source' ? sourceSchema : targetSchema;
  if (editingContext.colIndex >= 0) {
    schema[editingContext.tableName][editingContext.colIndex] = col;
  } else {
    schema[editingContext.tableName].push(col);
  }
  closeColumnModal();
  renderSchema(editingContext.side);
}

function closeColumnModal() {
  document.getElementById('columnModal').style.display = 'none';
  editingContext = null;
}

function removeColumn(side, tableName, colIndex) {
  const schema = side === 'source' ? sourceSchema : targetSchema;
  schema[tableName].splice(colIndex, 1);
  renderSchema(side);
}

// ---- Templates ----
function loadTemplate(type) {
  const templates = {
    ecommerce: {
      source: {
        users: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'username', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: true, defaultVal: '' },
          { name: 'email', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'password_hash', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'created_at', type: 'TIMESTAMP', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: 'CURRENT_TIMESTAMP' }
        ],
        products: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'price', type: 'DECIMAL(10,2)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '0.00' },
          { name: 'stock', type: 'INT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '0' },
          { name: 'category_id', type: 'INT', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: 'NULL' }
        ],
        orders: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'user_id', type: 'INT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'total', type: 'DECIMAL(10,2)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '0.00' },
          { name: 'status', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: "'pending'" },
          { name: 'created_at', type: 'TIMESTAMP', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: 'CURRENT_TIMESTAMP' }
        ]
      },
      target: {
        users: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'username', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: true, defaultVal: '' },
          { name: 'email', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'password_hash', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'phone', type: 'VARCHAR(20)', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: 'NULL' },
          { name: 'avatar_url', type: 'TEXT', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: 'NULL' },
          { name: 'role', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: "'user'" },
          { name: 'is_active', type: 'BOOLEAN', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: 'TRUE' },
          { name: 'created_at', type: 'TIMESTAMP', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'TIMESTAMP', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: 'CURRENT_TIMESTAMP' }
        ],
        products: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'description', type: 'TEXT', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: 'NULL' },
          { name: 'price', type: 'DECIMAL(10,2)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '0.00' },
          { name: 'compare_price', type: 'DECIMAL(10,2)', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: 'NULL' },
          { name: 'sku', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: true, defaultVal: '' },
          { name: 'stock', type: 'INT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '0' },
          { name: 'category_id', type: 'INT', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: 'NULL' },
          { name: 'is_published', type: 'BOOLEAN', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: 'FALSE' },
          { name: 'created_at', type: 'TIMESTAMP', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: 'CURRENT_TIMESTAMP' }
        ],
        categories: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'slug', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: true, defaultVal: '' },
          { name: 'parent_id', type: 'INT', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: 'NULL' }
        ],
        order_items: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'order_id', type: 'INT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'product_id', type: 'INT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'quantity', type: 'INT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '1' },
          { name: 'unit_price', type: 'DECIMAL(10,2)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' }
        ]
      }
    },
    blog: {
      source: {
        posts: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'title', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'content', type: 'TEXT', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'author_id', type: 'INT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'created_at', type: 'TIMESTAMP', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: 'CURRENT_TIMESTAMP' }
        ],
        authors: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'bio', type: 'TEXT', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: 'NULL' }
        ]
      },
      target: {
        posts: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'title', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'slug', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: true, defaultVal: '' },
          { name: 'content', type: 'TEXT', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'excerpt', type: 'TEXT', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: 'NULL' },
          { name: 'author_id', type: 'INT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'status', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: "'draft'" },
          { name: 'view_count', type: 'INT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '0' },
          { name: 'created_at', type: 'TIMESTAMP', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'TIMESTAMP', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: 'CURRENT_TIMESTAMP' }
        ],
        authors: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'email', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: true, defaultVal: '' },
          { name: 'bio', type: 'TEXT', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: 'NULL' },
          { name: 'avatar_url', type: 'TEXT', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: 'NULL' }
        ],
        comments: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'post_id', type: 'INT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'author_name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'body', type: 'TEXT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'created_at', type: 'TIMESTAMP', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: 'CURRENT_TIMESTAMP' }
        ],
        tags: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: true, defaultVal: '' },
          { name: 'slug', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: true, defaultVal: '' }
        ]
      }
    },
    saas: {
      source: {
        users: [
          { name: 'id', type: 'UUID', primaryKey: true, notNull: true, autoIncrement: false, unique: true, defaultVal: '' },
          { name: 'email', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: true, defaultVal: '' },
          { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' }
        ],
        plans: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'price_monthly', type: 'DECIMAL(10,2)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '0.00' }
        ]
      },
      target: {
        users: [
          { name: 'id', type: 'UUID', primaryKey: true, notNull: true, autoIncrement: false, unique: true, defaultVal: '' },
          { name: 'email', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: true, defaultVal: '' },
          { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'plan_id', type: 'INT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '1' },
          { name: 'trial_ends_at', type: 'TIMESTAMP', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: 'NULL' },
          { name: 'is_active', type: 'BOOLEAN', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: 'TRUE' }
        ],
        plans: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'price_monthly', type: 'DECIMAL(10,2)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '0.00' },
          { name: 'price_yearly', type: 'DECIMAL(10,2)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '0.00' },
          { name: 'max_projects', type: 'INT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '5' },
          { name: 'max_members', type: 'INT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '1' }
        ],
        projects: [
          { name: 'id', type: 'UUID', primaryKey: true, notNull: true, autoIncrement: false, unique: true, defaultVal: '' },
          { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'owner_id', type: 'UUID', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'created_at', type: 'TIMESTAMP', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: 'CURRENT_TIMESTAMP' }
        ],
        audit_log: [
          { name: 'id', type: 'BIGINT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'user_id', type: 'UUID', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'action', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'details', type: 'TEXT', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: 'NULL' },
          { name: 'ip_address', type: 'VARCHAR(255)', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: 'NULL' },
          { name: 'created_at', type: 'TIMESTAMP', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: 'CURRENT_TIMESTAMP' }
        ]
      }
    },
    social: {
      source: {
        users: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'username', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: true, defaultVal: '' },
          { name: 'display_name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' }
        ],
        posts: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'user_id', type: 'INT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'body', type: 'TEXT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'created_at', type: 'TIMESTAMP', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: 'CURRENT_TIMESTAMP' }
        ]
      },
      target: {
        users: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'username', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: true, defaultVal: '' },
          { name: 'display_name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'bio', type: 'TEXT', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: 'NULL' },
          { name: 'avatar_url', type: 'TEXT', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: 'NULL' },
          { name: 'follower_count', type: 'INT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '0' },
          { name: 'is_verified', type: 'BOOLEAN', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: 'FALSE' }
        ],
        posts: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: true, unique: false, defaultVal: '' },
          { name: 'user_id', type: 'INT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'body', type: 'TEXT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'media_url', type: 'TEXT', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: 'NULL' },
          { name: 'like_count', type: 'INT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '0' },
          { name: 'repost_count', type: 'INT', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: '0' },
          { name: 'reply_to_id', type: 'INT', primaryKey: false, notNull: false, autoIncrement: false, unique: false, defaultVal: 'NULL' },
          { name: 'created_at', type: 'TIMESTAMP', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: 'CURRENT_TIMESTAMP' }
        ],
        follows: [
          { name: 'follower_id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'following_id', type: 'INT', primaryKey: true, notNull: true, autoIncrement: false, unique: false, defaultVal: '' },
          { name: 'created_at', type: 'TIMESTAMP', primaryKey: false, notNull: true, autoIncrement: false, unique: false, defaultVal: 'CURRENT_TIMESTAMP' }
        ]
      }
    }
  };
  if (templates[type]) {
    sourceSchema = JSON.parse(JSON.stringify(templates[type].source));
    targetSchema = JSON.parse(JSON.stringify(templates[type].target));
    renderSchema('source');
    renderSchema('target');
  }
}

// ---- Schema Difference Detection ----
function detectDifferences() {
  const diffs = [];
  const srcTables = new Set(Object.keys(sourceSchema));
  const tgtTables = new Set(Object.keys(targetSchema));

  // New tables in target
  tgtTables.forEach(t => {
    if (!srcTables.has(t)) {
      diffs.push({ type: 'table-added', detail: `New table "${t}" (${targetSchema[t].length} columns)` });
    }
  });

  // Removed tables from target
  srcTables.forEach(t => {
    if (!tgtTables.has(t)) {
      diffs.push({ type: 'table-removed', detail: `Table "${t}" removed in target` });
    }
  });

  // Modified tables
  srcTables.forEach(t => {
    if (!tgtTables.has(t)) return;
    const srcCols = sourceSchema[t];
    const tgtCols = targetSchema[t];
    const srcColMap = {};
    const tgtColMap = {};
    srcCols.forEach((c, i) => { srcColMap[c.name.toLowerCase()] = { ...c, idx: i }; });
    tgtCols.forEach((c, i) => { tgtColMap[c.name.toLowerCase()] = { ...c, idx: i }; });

    // Added columns
    tgtCols.forEach(c => {
      if (!srcColMap[c.name.toLowerCase()]) {
        diffs.push({ type: 'col-added', table: t, detail: `Column "${c.name}" (${c.type}) added` });
      }
    });

    // Removed columns
    srcCols.forEach(c => {
      if (!tgtColMap[c.name.toLowerCase()]) {
        diffs.push({ type: 'col-removed', table: t, detail: `Column "${c.name}" removed` });
      }
    });

    // Modified columns
    srcCols.forEach(sc => {
      const tc = tgtColMap[sc.name.toLowerCase()];
      if (!tc) return;
      const changes = [];
      if (sc.type !== tc.type) changes.push(`type: ${sc.type} → ${tc.type}`);
      if ((sc.notNull ? 1 : 0) !== (tc.notNull ? 1 : 0)) changes.push(`NOT NULL: ${tc.notNull}`);
      if ((sc.unique ? 1 : 0) !== (tc.unique ? 1 : 0)) changes.push(`UNIQUE: ${tc.unique}`);
      if (sc.defaultVal !== tc.defaultVal) changes.push(`default: "${sc.defaultVal}" → "${tc.defaultVal}"`);
      if (changes.length > 0) {
        diffs.push({ type: 'col-modified', table: t, detail: `Column "${sc.name}" modified: ${changes.join(', ')}` });
      }
    });
  });

  renderDiffs(diffs);
  return diffs;
}

function renderDiffs(diffs) {
  const container = document.getElementById('diffResults');
  if (diffs.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px"><span style="font-size:40px">✅</span><p style="margin-top:10px;color:#94a3b8">Schemas are identical!</p></div>';
    return;
  }
  const iconMap = { 'table-added': '🆕', 'table-removed': '🗑️', 'col-added': '➕', 'col-removed': '➖', 'col-modified': '🔧' };
  const classMap = { 'table-added': 'diff-added', 'table-removed': 'diff-removed', 'col-added': 'diff-added', 'col-removed': 'diff-removed', 'col-modified': 'diff-modified' };
  const labelMap = { 'table-added': 'TABLE ADDED', 'table-removed': 'TABLE REMOVED', 'col-added': 'COLUMN ADDED', 'col-removed': 'COLUMN REMOVED', 'col-modified': 'COLUMN MODIFIED' };
  container.innerHTML = `<div style="margin-bottom:12px;color:#94a3b8;font-size:13px">Found ${diffs.length} difference(s)</div>` +
    diffs.map(d => `<div class="diff-item ${classMap[d.type]}">
      <span class="diff-icon">${iconMap[d.type]}</span>
      <span class="diff-label">${labelMap[d.type]}</span>
      ${d.table ? `<span style="color:#fbbf24;font-family:monospace;font-size:12px">${d.table}</span>` : ''}
      <span class="diff-detail">${esc(d.detail)}</span>
    </div>`).join('');
}

// ---- SQL Generation ----
function generateMigrationSQL() {
  const srcTables = new Set(Object.keys(sourceSchema));
  const tgtTables = new Set(Object.keys(targetSchema));
  let sql = [];
  let rollbackSql = [];
  const timestamp = new Date().toISOString();

  sql.push(`-- ========================================================`);
  sql.push(`-- DBMigrator-AI — Migration Script`);
  sql.push(`-- Generated: ${timestamp}`);
  sql.push(`-- ========================================================\n`);

  rollbackSql.push(`-- ========================================================`);
  rollbackSql.push(`-- DBMigrator-AI — Rollback Script`);
  rollbackSql.push(`-- Generated: ${timestamp}`);
  rollbackSql.push(`-- ========================================================\n`);

  // New tables in target
  tgtTables.forEach(tableName => {
    if (!srcTables.has(tableName)) {
      const cols = targetSchema[tableName];
      sql.push(`CREATE TABLE ${tableName} (`);
      const colDefs = cols.map(c => {
        let def = `  ${c.name} ${c.type}`;
        if (c.primaryKey) def += ' PRIMARY KEY';
        if (c.autoIncrement) def += ' AUTO_INCREMENT';
        if (c.notNull) def += ' NOT NULL';
        if (c.unique && !c.primaryKey) def += ' UNIQUE';
        if (c.defaultVal) def += ` DEFAULT ${c.defaultVal}`;
        return def;
      });
      sql.push(colDefs.join(',\n'));
      sql.push(`);\n`);

      rollbackSql.push(`DROP TABLE IF EXISTS ${tableName};\n`);
    }
  });

  // Modified tables — ALTER statements
  srcTables.forEach(tableName => {
    if (!tgtTables.has(tableName)) return;
    const srcCols = sourceSchema[tableName];
    const tgtCols = targetSchema[tableName];
    const srcColMap = {};
    const tgtColMap = {};
    srcCols.forEach(c => { srcColMap[c.name.toLowerCase()] = c; });
    tgtCols.forEach(c => { tgtColMap[c.name.toLowerCase()] = c; });

    let alters = [];
    let rollbackAlters = [];

    tgtCols.forEach(tc => {
      if (!srcColMap[tc.name.toLowerCase()]) {
        alters.push(`ALTER TABLE ${tableName} ADD COLUMN ${tc.name} ${tc.type}${tc.notNull ? ' NOT NULL' : ''}${tc.unique ? ' UNIQUE' : ''}${tc.defaultVal ? ' DEFAULT ' + tc.defaultVal : ''};`);
        rollbackAlters.push(`ALTER TABLE ${tableName} DROP COLUMN ${tc.name};`);
      }
    });

    srcCols.forEach(sc => {
      if (!tgtColMap[sc.name.toLowerCase()]) {
        rollbackAlters.push(`ALTER TABLE ${tableName} ADD COLUMN ${sc.name} ${sc.type}${sc.notNull ? ' NOT NULL' : ''}${sc.unique ? ' UNIQUE' : ''}${sc.defaultVal ? ' DEFAULT ' + sc.defaultVal : ''};`);
        alters.push(`ALTER TABLE ${tableName} DROP COLUMN ${sc.name};`);
      }
    });

    srcCols.forEach(sc => {
      const tc = tgtColMap[sc.name.toLowerCase()];
      if (!tc || tgtColMap[sc.name.toLowerCase()] === undefined) return;
      if (sc.type !== tc.type) {
        alters.push(`ALTER TABLE ${tableName} MODIFY COLUMN ${sc.name} ${tc.type}${tc.notNull ? ' NOT NULL' : ''};`);
        rollbackAlters.push(`ALTER TABLE ${tableName} MODIFY COLUMN ${sc.name} ${sc.type}${sc.notNull ? ' NOT NULL' : ''};`);
      }
    });

    if (alters.length > 0) {
      sql.push(`-- Modifications for ${tableName}`);
      sql.push(...alters);
      sql.push('');
      rollbackSql.push(`-- Rollback for ${tableName}`);
      rollbackSql.push(...rollbackAlters);
      rollbackSql.push('');
    }
  });

  // Removed tables from target
  srcTables.forEach(tableName => {
    if (!tgtTables.has(tableName)) {
      sql.push(`DROP TABLE IF EXISTS ${tableName};\n`);
      rollbackSql.push(`-- Recreate ${tableName} (source schema)`);
      const cols = sourceSchema[tableName];
      rollbackSql.push(`CREATE TABLE ${tableName} (`);
      rollbackSql.push(cols.map(c => {
        let def = `  ${c.name} ${c.type}`;
        if (c.primaryKey) def += ' PRIMARY KEY';
        if (c.autoIncrement) def += ' AUTO_INCREMENT';
        if (c.notNull) def += ' NOT NULL';
        if (c.unique && !c.primaryKey) def += ' UNIQUE';
        if (c.defaultVal) def += ` DEFAULT ${c.defaultVal}`;
        return def;
      }).join(',\n'));
      rollbackSql.push(`);\n`);
    }
  });

  currentMigration = {
    forward: sql.join('\n'),
    rollback: rollbackSql.join('\n'),
    timestamp,
    diffCount: detectDifferences().length
  };

  document.getElementById('sqlPreview').textContent = currentMigration.forward;
  document.getElementById('rollbackPreview').textContent = currentMigration.rollback;
  document.getElementById('btnExport').disabled = false;

  switchTab('preview');
  document.querySelectorAll('.tab')[2].click();
}

// ---- Rollback Generation ----
function generateRollback() {
  if (!currentMigration) {
    document.getElementById('rollbackPreview').textContent = '-- Generate a migration first, then rollback will be available.';
    return;
  }
  document.getElementById('rollbackPreview').textContent = currentMigration.rollback;
}

// ---- SQL Copy ----
function copySQL(type) {
  const text = type === 'rollback' ? currentMigration?.rollback : currentMigration?.forward;
  if (!text) { alert('Nothing to copy'); return; }
  navigator.clipboard.writeText(text).then(() => alert('SQL copied to clipboard!')).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    alert('SQL copied!');
  });
}

// ---- Simulate Execute ----
function simulateExecute() {
  if (!currentMigration) return;
  const logContainer = document.getElementById('executionLog');
  const logContent = document.getElementById('executionLogContent');
  logContainer.style.display = 'block';
  logContent.innerHTML = '';

  const statements = currentMigration.forward.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
  let i = 0;
  function next() {
    if (i >= statements.length) {
      const successCount = logContent.querySelectorAll('.exec-success').length;
      logContent.innerHTML += `<div class="exec-entry exec-success">✅ Migration complete. ${successCount}/${statements.length} statements executed successfully.</div>`;
      saveToHistory(statements.length);
      return;
    }
    const stmt = statements[i].trim();
    if (!stmt || stmt.startsWith('--')) { i++; next(); return; }
    const firstWord = stmt.split(/\s+/)[0].toUpperCase();
    const icon = firstWord === 'CREATE' ? '📋' : firstWord === 'ALTER' ? '🔧' : firstWord === 'DROP' ? '🗑️' : '▶️';
    const success = Math.random() > 0.05; // 95% success
    const delay = 200 + Math.random() * 400;
    setTimeout(() => {
      logContent.innerHTML += `<div class="exec-entry ${success ? 'exec-success' : 'exec-error'}">${success ? '✅' : '❌'} ${icon} ${esc(stmt.substring(0, 80))}${stmt.length > 80 ? '...' : ''}</div>`;
      logContent.scrollTop = logContent.scrollHeight;
      i++;
      next();
    }, delay);
  }
  next();
}

// ---- Save to History ----
function saveToHistory(statementCount) {
  const entry = {
    id: Date.now(),
    timestamp: currentMigration.timestamp,
    diffCount: currentMigration.diffCount,
    statementCount,
    sourceTables: Object.keys(sourceSchema),
    targetTables: Object.keys(targetSchema),
    forward: currentMigration.forward,
    rollback: currentMigration.rollback
  };
  migrationHistory.unshift(entry);
  if (migrationHistory.length > 50) migrationHistory = migrationHistory.slice(0, 50);
  localStorage.setItem('dbmig_history', JSON.stringify(migrationHistory));
}

// ---- History ----
function showHistory() {
  const container = document.getElementById('historyList');
  if (migrationHistory.length === 0) {
    container.innerHTML = '<p class="placeholder">No migration history yet.</p>';
  } else {
    container.innerHTML = migrationHistory.map(h => `
      <div class="history-entry">
        <div>
          <div class="history-name">Migration #${h.id}</div>
          <div class="history-date">${new Date(h.timestamp).toLocaleString()}</div>
        </div>
        <div class="history-stats">
          <span>📝 ${h.statementCount} statements</span>
          <span>🔍 ${h.diffCount} diffs</span>
          <button class="btn btn-small" onclick="loadMigration(${h.id})">Load</button>
        </div>
      </div>
    `).join('');
  }
  document.getElementById('historyModal').style.display = 'flex';
}

function loadMigration(id) {
  const entry = migrationHistory.find(h => h.id === id);
  if (!entry) return;
  currentMigration = {
    forward: entry.forward,
    rollback: entry.rollback,
    timestamp: entry.timestamp,
    diffCount: entry.diffCount
  };
  document.getElementById('sqlPreview').textContent = currentMigration.forward;
  document.getElementById('rollbackPreview').textContent = currentMigration.rollback;
  document.getElementById('btnExport').disabled = false;
  closeHistory();
  switchTab('preview');
  document.querySelectorAll('.tab')[2].click();
}

function closeHistory() {
  document.getElementById('historyModal').style.display = 'none';
}

// ---- Export ----
function exportMigration() {
  if (!currentMigration) return;
  const content = currentMigration.forward + '\n\n-- ============ ROLLBACK ============\n\n' + currentMigration.rollback;
  const blob = new Blob([content], { type: 'text/sql' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `migration_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.sql`;
  a.click();
  URL.revokeObjectURL(url);
}

function newMigration() {
  sourceSchema = {};
  targetSchema = {};
  currentMigration = null;
  document.getElementById('sqlPreview').textContent = '-- No migration generated yet.';
  document.getElementById('rollbackPreview').textContent = '-- No rollback generated yet.';
  document.getElementById('btnExport').disabled = true;
  document.getElementById('diffResults').innerHTML = '<p class="placeholder">Click "Detect Differences" to compare schemas.</p>';
  document.getElementById('executionLog').style.display = 'none';
  renderSchema('source');
  renderSchema('target');
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
