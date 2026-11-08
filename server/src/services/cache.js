/**
 * Cache em memória com TTL.
 *
 * Porquê: a versão anterior chamava a Google Places API em cada pesquisa e,
 * para cada resultado, fazia 1 getDetails + 2 chamadas de Directions. Uma
 * pesquisa com 20 resultados custava ~60 chamadas faturadas. As pesquisas
 * repetem-se muito ("cardiologia em Braga"), por isso a cache corta a
 * maior parte do custo.
 *
 * Para várias instâncias (Vercel, etc.) substituir por Redis mantendo
 * esta mesma interface.
 */

class TtlCache {
  constructor({ ttlSeconds = 3600, maxEntries = 500 } = {}) {
    this.ttlMs = ttlSeconds * 1000;
    this.maxEntries = maxEntries;
    this.store = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  get(key) {
    const hit = this.store.get(key);
    if (!hit) {
      this.misses += 1;
      return undefined;
    }
    if (Date.now() > hit.expiresAt) {
      this.store.delete(key);
      this.misses += 1;
      return undefined;
    }
    // LRU simples: reinserir move a chave para o fim da ordem de iteração.
    this.store.delete(key);
    this.store.set(key, hit);
    this.hits += 1;
    return hit.value;
  }

  set(key, value) {
    if (this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    return value;
  }

  /** Executa `producer` apenas se a chave não estiver em cache. */
  async wrap(key, producer) {
    const cached = this.get(key);
    if (cached !== undefined) return cached;
    const value = await producer();
    return this.set(key, value);
  }

  stats() {
    const total = this.hits + this.misses;
    return {
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total ? Math.round((this.hits / total) * 100) / 100 : 0,
    };
  }

  clear() {
    this.store.clear();
  }
}

module.exports = { TtlCache };
