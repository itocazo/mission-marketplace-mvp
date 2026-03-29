'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { MissionCategory, RewardModel } from '@/lib/types';
import { calculateBaseReward } from '@/lib/pricing';
import PricingCalculator from '@/components/missions/PricingCalculator';
import { ALL_SKILLS } from '@/lib/data';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';

export default function NewMissionPage() {
  const router = useRouter();
  const { createMission, getCurrentUser } = useStore();
  const user = getCurrentUser();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState<string[]>(['']);
  const [category, setCategory] = useState<MissionCategory>('operational');
  const [rewardModel, setRewardModel] = useState<RewardModel>('fixed');
  const [estimatedHours, setEstimatedHours] = useState(40);
  const [deadline, setDeadline] = useState('2026-05-01');
  const [complexity, setComplexity] = useState(1.5);
  const [urgency, setUrgency] = useState(1.2);
  const [strategicImportance, setStrategicImportance] = useState(1.0);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const toast = useToast(s => s.add);

  const baseReward = calculateBaseReward(estimatedHours, complexity, urgency, strategicImportance);

  function addCriteria() { setCriteria([...criteria, '']); }
  function removeCriteria(i: number) { setCriteria(criteria.filter((_, idx) => idx !== i)); }
  function updateCriteria(i: number, val: string) { setCriteria(criteria.map((c, idx) => idx === i ? val : c)); }

  function toggleSkill(skill: string) {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  }

  const filteredSkills = ALL_SKILLS.filter(s =>
    s.toLowerCase().includes(skillSearch.toLowerCase()) && !selectedSkills.includes(s)
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validCriteria = criteria.filter(c => c.trim());
    if (!title || !description || validCriteria.length === 0) return;

    createMission({
      title,
      description,
      successCriteria: validCriteria,
      category,
      rewardModel,
      estimatedHours,
      deadline,
      requiredSkills: selectedSkills,
      complexity,
      urgency,
      strategicImportance,
      baseReward,
      creatorId: user.id,
      createdAt: new Date().toISOString().split('T')[0],
    });

    toast('Mission posted to marketplace!');
    router.push('/missions');
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/missions" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Missions
      </Link>

      <h1 className="mb-8 text-2xl font-bold text-gray-900">Create New Mission</h1>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Mission Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Build Real-Time Metrics Dashboard"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the challenge, context, and expected deliverables..."
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
              required
            />
          </div>

          {/* Success Criteria */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Success Criteria</label>
            <div className="space-y-2">
              {criteria.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={c}
                    onChange={e => updateCriteria(i, e.target.value)}
                    placeholder={`Criterion ${i + 1}`}
                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-300 focus:outline-none"
                  />
                  {criteria.length > 1 && (
                    <button type="button" onClick={() => removeCriteria(i)} className="text-gray-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addCriteria} className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700">
                <Plus className="h-3.5 w-3.5" /> Add criterion
              </button>
            </div>
          </div>

          {/* Category & Model */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as MissionCategory)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-violet-300 focus:outline-none"
              >
                <option value="strategic">Strategic</option>
                <option value="operational">Operational</option>
                <option value="exploratory">Exploratory</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Reward Model</label>
              <select
                value={rewardModel}
                onChange={e => setRewardModel(e.target.value as RewardModel)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-violet-300 focus:outline-none"
              >
                <option value="fixed">Fixed Reward</option>
                <option value="auction">Auction (Vickrey)</option>
                <option value="lottery">Lottery</option>
              </select>
            </div>
          </div>

          {/* Hours & Deadline */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Estimated Hours</label>
              <input
                type="number"
                value={estimatedHours}
                onChange={e => setEstimatedHours(Number(e.target.value))}
                min={1}
                max={500}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-violet-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-violet-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Pricing Sliders */}
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900">Pricing Parameters</h3>
            <SliderField
              label="Complexity"
              value={complexity}
              onChange={setComplexity}
              min={1.0}
              max={3.0}
              step={0.1}
              description="How many skills and how much expertise is needed?"
            />
            <SliderField
              label="Urgency"
              value={urgency}
              onChange={setUrgency}
              min={1.0}
              max={2.0}
              step={0.1}
              description="How tight is the deadline?"
            />
            <SliderField
              label="Strategic Importance"
              value={strategicImportance}
              onChange={setStrategicImportance}
              min={0.8}
              max={1.5}
              step={0.1}
              description="How closely aligned with current OKRs?"
            />
          </div>

          {/* Required Skills */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Required Skills</label>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {selectedSkills.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className="flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 hover:bg-violet-200"
                >
                  {skill} <X className="h-3 w-3" />
                </button>
              ))}
            </div>
            <input
              value={skillSearch}
              onChange={e => setSkillSearch(e.target.value)}
              placeholder="Search skills..."
              className="mb-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-300 focus:outline-none"
            />
            <div className="flex flex-wrap gap-1.5">
              {filteredSkills.slice(0, 10).map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 hover:border-violet-300 hover:bg-violet-50"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
          >
            Post Mission to Marketplace
          </button>
        </div>

        {/* Right sidebar: Pricing Preview — sticky so it follows the form */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <PricingCalculator
            estimatedHours={estimatedHours}
            complexity={complexity}
            urgency={urgency}
            strategicImportance={strategicImportance}
          />
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-xs text-gray-500">
            <p className="mb-2 font-semibold text-gray-700">How pricing works</p>
            <p>Reward = Base (10 pts/hr) x Complexity x Urgency x Strategic Importance x Hours.</p>
            <p className="mt-1">Pricing adjusts dynamically as the deadline approaches and based on solver availability.</p>
          </div>
        </div>
      </form>
    </div>
  );
}

function SliderField({ label, value, onChange, min, max, step, description }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; description: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="font-mono text-sm font-bold text-violet-600">{value.toFixed(1)}x</span>
      </div>
      <input
        type="range"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full accent-violet-600"
      />
      <p className="mt-0.5 text-xs text-gray-400">{description}</p>
    </div>
  );
}
