// Brilliants — Supabase Configuration
// Shared config for Partner Management System
// ============================================================

var BRILLIANTS_SUPABASE = {
  URL: 'https://ekjakdhxodugncdpwkrj.supabase.co',
  ANON_KEY: 'sb_publishable_wfkvHgTcFlVdWOqbGRfpOA_O2pGf7YS'
};

// Supabase client helper (lightweight — no SDK dependency)
var SupabaseClient = (function() {
  'use strict';

  var config = BRILLIANTS_SUPABASE;

  function headers(authToken) {
    var h = {
      'Content-Type': 'application/json',
      'apikey': config.ANON_KEY,
      'Prefer': 'return=representation'
    };
    if (authToken) h['Authorization'] = 'Bearer ' + authToken;
    return h;
  }

  function getToken() {
    try {
      var session = JSON.parse(localStorage.getItem('brilliants_partner_session') || 'null');
      return session ? session.access_token : null;
    } catch(e) { return null; }
  }

  function setSession(session) {
    localStorage.setItem('brilliants_partner_session', JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem('brilliants_partner_session');
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem('brilliants_partner_session') || 'null');
    } catch(e) { return null; }
  }

  // Auth: Sign up with email
  function signUp(email, password, metadata) {
    return fetch(config.URL + '/auth/v1/signup', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        email: email,
        password: password,
        data: metadata || {}
      })
    }).then(function(r) { return r.json(); });
  }

  // Auth: Sign in with email
  function signIn(email, password) {
    return fetch(config.URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email: email, password: password })
    }).then(function(r) { return r.json(); });
  }

  // Auth: Get current user
  function getUser(accessToken) {
    return fetch(config.URL + '/auth/v1/user', {
      method: 'GET',
      headers: headers(accessToken || getToken())
    }).then(function(r) { return r.json(); });
  }

  // Auth: Sign out
  function signOut() {
    clearSession();
    return Promise.resolve();
  }

  // REST: Select (flat API)
  function select(table, query, authToken) {
    var url = config.URL + '/rest/v1/' + table + '?' + query;
    return fetch(url, {
      method: 'GET',
      headers: headers(authToken || getToken())
    }).then(function(r) { return r.json(); });
  }

  // REST: Insert (flat API)
  function insert(table, data, authToken) {
    return fetch(config.URL + '/rest/v1/' + table, {
      method: 'POST',
      headers: headers(authToken || getToken()),
      body: JSON.stringify(data)
    }).then(function(r) { return r.json(); });
  }

  // REST: Update (flat API)
  function update(table, query, data, authToken) {
    return fetch(config.URL + '/rest/v1/' + table + '?' + query, {
      method: 'PATCH',
      headers: headers(authToken || getToken()),
      body: JSON.stringify(data)
    }).then(function(r) { return r.json(); });
  }

  // REST: RPC (call stored function)
  function rpc(functionName, params, authToken) {
    return fetch(config.URL + '/rest/v1/rpc/' + functionName, {
      method: 'POST',
      headers: headers(authToken || getToken()),
      body: JSON.stringify(params || {})
    }).then(function(r) { return r.json(); });
  }

  // Chainable query builder (for admin pages)
  function from(table) {
    var _table = table;
    var _selectCols = '*';
    var _orderCol = null;
    var _orderAsc = true;
    var _filters = [];
    var _token = getToken();

    var builder = {
      select: function(cols) { _selectCols = cols || '*'; return builder; },
      order: function(col, opts) { _orderCol = col; _orderAsc = opts && opts.ascending !== undefined ? opts.ascending : true; return builder; },
      eq: function(col, val) { _filters.push(col + '=eq.' + encodeURIComponent(val)); return builder; },
      neq: function(col, val) { _filters.push(col + '=neq.' + encodeURIComponent(val)); return builder; },
      in: function(col, vals) { _filters.push(col + '=in.(' + vals.map(encodeURIComponent).join(',') + ')'); return builder; },
      gte: function(col, val) { _filters.push(col + '=gte.' + encodeURIComponent(val)); return builder; },
      lte: function(col, val) { _filters.push(col + '=lte.' + encodeURIComponent(val)); return builder; },
      single: function() { builder._single = true; return builder; },

      insert: function(data) {
        var arr = Array.isArray(data) ? data : [data];
        return fetch(config.URL + '/rest/v1/' + _table, {
          method: 'POST',
          headers: headers(_token),
          body: JSON.stringify(arr.length === 1 ? arr[0] : arr)
        }).then(function(r) { return r.json().then(function(d) { return { data: Array.isArray(d) ? d : [d], error: null }; }); })
          .catch(function(e) { return { data: null, error: { message: e.message } }; });
      },

      update: function(data) {
        var qs = _filters.length ? '?' + _filters.join('&') : '';
        return fetch(config.URL + '/rest/v1/' + _table + qs, {
          method: 'PATCH',
          headers: headers(_token),
          body: JSON.stringify(data)
        }).then(function(r) { return r.json().then(function(d) { return { data: d, error: null }; }); })
          .catch(function(e) { return { data: null, error: { message: e.message } }; });
      },

      delete: function() {
        var qs = _filters.length ? '?' + _filters.join('&') : '';
        return fetch(config.URL + '/rest/v1/' + _table + qs, {
          method: 'DELETE',
          headers: headers(_token)
        }).then(function(r) { return r.json().then(function(d) { return { data: d, error: null }; }); })
          .catch(function(e) { return { data: null, error: { message: e.message } }; });
      },

      then: function(resolve, reject) {
        var qs = [];
        qs.push('select=' + encodeURIComponent(_selectCols));
        if (_orderCol) qs.push('order=' + _orderCol + (_orderAsc ? '.asc' : '.desc'));
        _filters.forEach(function(f) { qs.push(f); });

        var url = config.URL + '/rest/v1/' + _table + '?' + qs.join('&');
        var p = fetch(url, {
          method: 'GET',
          headers: headers(_token)
        }).then(function(r) { return r.json(); })
          .then(function(data) {
            if (builder._single && Array.isArray(data) && data.length > 0) data = data[0];
            return { data: data, error: null };
          })
          .catch(function(e) { return { data: null, error: { message: e.message } }; });

        return p.then(resolve, reject);
      }
    };

    return builder;
  }

  return {
    config: config,
    getToken: getToken,
    setSession: setSession,
    clearSession: clearSession,
    getSession: getSession,
    signUp: signUp,
    signIn: signIn,
    getUser: getUser,
    signOut: signOut,
    select: select,
    insert: insert,
    update: update,
    rpc: rpc,
    from: from
  };
})();
