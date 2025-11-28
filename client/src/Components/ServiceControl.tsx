import { Play, Square } from "lucide-react";

type Props = {
  isRunning: boolean;
  toggleService: () => void;
}

const ServiceControl = ({ isRunning, toggleService }: Props) => (
  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
      <div>
        <h4 className="text-white font-medium">Suricata Service</h4>
        <p className="text-slate-400 text-xs">{isRunning ? 'Active - Monitoring Traffic' : 'Stopped - No Protection'}</p>
      </div>
    </div>
    <button 
      onClick={toggleService}
      className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
        isRunning 
          ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
          : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
      }`}
    >
      {isRunning ? <><Square size={16} /> Stop Engine</> : <><Play size={16} /> Start Engine</>}
    </button>
  </div>
);

export default ServiceControl