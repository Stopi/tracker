import {Pool} from "pg";

class Database {
  private pool: Pool;
  public query!: (queryText: string, params?: any[]) => Promise<any>;

  constructor(database_url: string) {
    this.pool = new Pool({connectionString: database_url});
    this.query = this.pool.query.bind(this.pool);
  }

  async insert(table:string, parameters:Record<string, any>): Promise<number|null> {
    let fields:string[] = [];
    let values:any[]  = [];
    let params:string[] = [];
    let i = 1;
    for (const [f, v] of Object.entries(parameters)) {
      fields.push(f);
      values.push(v);
      params.push('$' + i);
      i++;
    }
    const q = `INSERT INTO ${table}(${fields.join(', ')}) VALUES (${params.join(', ')}) RETURNING id`;
    const res = await DB.query(q, values);
    return res && res.rowCount === 1 ? res.rows[0].id : null;
  }

  async update(table:string, id:number, parameters:Record<string, any>): Promise<boolean> {
    let params:string[] = [];
    let values:any[]  = [ id ];
    let i = 2;
    for (const [f, v] of Object.entries(parameters)) {
      params.push(f + ' = $' + i);
      values.push(v);
      i++;
    }
    const q = `UPDATE ${table} SET ${params.join(', ')} WHERE id = $1`;
    const res = await DB.query(q, values);
    return res && res.rowCount === 1;
  }

  async upsert(table:string, parameters:Record<string, any>, conflict_fields:string): Promise<boolean> {
    let fields:string[] = [];
    let values:any[]  = [];
    let insert_params:string[] = [];
    let update_params:string[] = [];
    let i = 1;
    for (const [f, v] of Object.entries(parameters)) {
      fields.push(f);
      values.push(v);
      insert_params.push('$' + i);
      update_params.push(f + ' = $' + i);
      i++;
    }
    const q = `INSERT INTO ${table}(${fields.join(', ')}) VALUES (${insert_params.join(', ')})`
      + ` ON CONFLICT (${conflict_fields})`
      + ` DO UPDATE SET ${update_params.join(', ')}`
    ;
// console.log(q);
    const res = await DB.query(q, values);
    return res && res.rowCount === 1;
  }

}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const DB = new Database(DATABASE_URL);
export default DB;