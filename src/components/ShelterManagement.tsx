import React, { useState } from 'react';
import { ShelterData } from '../types';
import {
  Home,
  MapPin,
  Utensils,
  Droplets,
  HeartPulse,
  Zap,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';

interface ShelterManagementProps {
  shelters: ShelterData[];
  onSelectShelterForRoute: (shelter: ShelterData) => void;
}

export const ShelterManagement: React.FC<ShelterManagementProps> = ({
  shelters,
  onSelectShelterForRoute,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'NEAR_CAPACITY' | 'FULL'>('ALL');

  const filteredShelters = shelters.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ShelterData['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            AVAILABLE
          </span>
        );
      case 'NEAR_CAPACITY':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            NEAR CAPACITY
          </span>
        );
      case 'FULL':
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            FULL
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Controls Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-600" />
            <span>SMART SHELTER ROSTER & LOGISTICS ENGINE</span>
          </h2>
          <p className="text-xs text-slate-500">
            Automated bed allocation, consumable supply tracking, and dynamic overflow diversion.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search shelters or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 w-56 font-medium"
            />
          </div>

          {/* Status Filter */}
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-medium">
            {(['ALL', 'AVAILABLE', 'NEAR_CAPACITY', 'FULL'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-md transition text-[11px] ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShelters.map((shelter) => {
          const occupancyPercent = Math.round((shelter.occupied / shelter.capacity) * 100);
          const isFull = shelter.status === 'FULL';
          const alternativeShelter = shelter.recommendedAlternativeId
            ? shelters.find((s) => s.id === shelter.recommendedAlternativeId)
            : null;

          return (
            <div
              key={shelter.id}
              className={`bg-white border rounded-2xl p-4 shadow-sm transition flex flex-col justify-between ${
                isFull
                  ? 'border-rose-200 bg-rose-50/20'
                  : shelter.status === 'NEAR_CAPACITY'
                  ? 'border-amber-200'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      {shelter.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{shelter.address}</span>
                    </div>
                  </div>
                  {getStatusBadge(shelter.status)}
                </div>

                {/* Capacity Metrics */}
                <div className="grid grid-cols-3 gap-2 my-3 text-center">
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-200/80">
                    <div className="text-[10px] text-slate-500 font-medium">Total Beds</div>
                    <div className="text-base font-bold font-mono text-slate-900">
                      {shelter.capacity}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-200/80">
                    <div className="text-[10px] text-slate-500 font-medium">Occupied</div>
                    <div className="text-base font-bold font-mono text-amber-700">
                      {shelter.occupied}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-200/80">
                    <div className="text-[10px] text-slate-500 font-medium">Available</div>
                    <div className="text-base font-bold font-mono text-emerald-700">
                      {shelter.available}
                    </div>
                  </div>
                </div>

                {/* Occupancy Progress Bar */}
                <div className="my-2.5">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500 font-mono font-medium">Occupancy</span>
                    <span className="font-mono font-bold text-slate-900">
                      {occupancyPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isFull
                          ? 'bg-rose-500'
                          : occupancyPercent > 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, occupancyPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Supplies & Logistics */}
                <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/80 font-medium">
                    <Utensils className="w-3.5 h-3.5 text-amber-600" />
                    <span>Food: <b>{shelter.foodSuppliesPercent}%</b></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/80 font-medium">
                    <Droplets className="w-3.5 h-3.5 text-sky-600" />
                    <span>Water: <b>{shelter.waterSuppliesPercent}%</b></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/80 font-medium">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                    <span>Medical: <b className={shelter.medicalStaffAvailable ? 'text-emerald-700' : 'text-slate-400'}>{shelter.medicalStaffAvailable ? 'Ready' : 'None'}</b></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/80 font-medium">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Power: <b className={shelter.backupPowerAvailable ? 'text-emerald-700' : 'text-slate-400'}>{shelter.backupPowerAvailable ? 'Genset Active' : 'Off-grid'}</b></span>
                  </div>
                </div>

                {/* Distance & Safety */}
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-2 font-mono">
                  <span>Distance: <b className="text-slate-800">{shelter.distanceKm} km</b></span>
                  <span>Safety: <b className="text-emerald-700">{shelter.safetyRating}</b></span>
                </div>

                {/* Overflow Reroute Box if Full */}
                {isFull && alternativeShelter && (
                  <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                    <div className="text-rose-800 font-semibold text-[11px] flex items-center gap-1 mb-1">
                      <span>⚠ AUTOMATIC OVERFLOW DIVERSION</span>
                    </div>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      Recommended Alternative:{' '}
                      <span className="font-bold text-slate-900">{alternativeShelter.name}</span>{' '}
                      ({alternativeShelter.available} beds free, {alternativeShelter.distanceKm} km).
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-2">
                <button
                  onClick={() => onSelectShelterForRoute(shelter)}
                  className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sky-800 font-bold text-xs flex items-center justify-center gap-2 transition border border-slate-200"
                >
                  <span>Route Evacuation Here</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
