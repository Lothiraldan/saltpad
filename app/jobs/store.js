// import {Dispatcher} from '../dispatcher';
// import {EventEmitter} from 'events';

// class JobsStore extends EventEmitter {

//     constructor() {
//         super();
//         this.jobs = new Map();

//         Dispatcher.on("ListJobs", this.onJobsList);
//     }

//     onJobsList = (jobs) => {
//         for (let job_id in jobs) {
//             this._merge_job(job_id, jobs[job_id]);
//         }
//         this.emit("CHANGE", {});
//     }

//     _merge_job = (job_id, job) => {
//         if(!this.jobs.has(job_id)) {
//             this.jobs.set(job_id, job);
//         } else {
//             throw "Existing jobs, TODO";
//         }
//     }

//     new_job = (job_id, job) => {
//         this._merge_job(job_id, job);
//         this.emit("CHANGE", {});
//     }

//     list() {
//         return this.jobs;
//     }
// }

// export default new JobsStore();
