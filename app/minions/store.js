// import {Dispatcher} from '../dispatcher';
// import {EventEmitter} from 'events';

// class MinionsStore extends EventEmitter {

//     constructor() {
//         super();
//         this.minions = new Map();
//     }

//     _merge_job = (minion_id, minion) => {
//         this.minions.set(minion_id, minion);
//     }

//     auth_minion = (auth_payload) => {
//         let minion_id = auth_payload.data.id;
//         var auth_payload = auth_payload.data;
//         console.log("Auth payload", auth_payload, minion_id);
//         let minion_data = {status: auth_payload.act, latest_auth: auth_payload._stamp}
//         this._merge_job(minion_id, minion_data);
//         this.emit("CHANGE", {});
//     }

//     list() {
//         return this.minions;
//     }
// }

// export default new MinionsStore();
