import React, { useState } from 'react';
import { X, User as UserIcon, Activity, FileText, TrendingUp, Award as AwardIcon, ShieldCheck, Sparkles, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';
import Badge from './Badge';

const AchievementForm = ({
  onSubmit,
  initialData = {},
  volunteers = [],
  onCancel,
  isLoading = false
}) => {
  const isEditing = !!initialData._id;

  const [formData, setFormData] = useState({
    volunteerId: initialData.volunteerId?._id || initialData.volunteerId || '',
    activityTitle: initialData.activityTitle || '',
    description: initialData.description || '',
    pointsAwarded: initialData.pointsAwarded || '',
    badgeType: initialData.badgeType || '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'volunteerId':
        if (!isEditing && (!value || !value.trim())) return 'Please select a volunteer';
        return '';
      case 'activityTitle':
        if (!value || !value.trim()) return 'Mission title is required';
        if (value.trim().length < 3) return 'Title must be at least 3 characters';
        if (value.trim().length > 100) return 'Title must be less than 100 characters';
        if (!/^[a-zA-Z0-9\s\-.,!?()]+$/.test(value.trim())) return 'Title contains invalid characters';
        return '';
      case 'description':
        if (!value || !value.trim()) return 'Mission details are required';
        if (value.trim().length < 10) return 'Description must be at least 10 characters';
        if (value.trim().length > 500) return 'Description must be less than 500 characters';
        return '';
      case 'pointsAwarded': {
        if (!value && value !== 0) return 'Points are required';
        const points = parseInt(value);
        if (isNaN(points)) return 'Please enter a valid number';
        if (points < 0) return 'Points cannot be negative';
        if (points > 10000) return 'Maximum points allowed is 10,000';
        return '';
      }
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = ['activityTitle', 'description', 'pointsAwarded'];
    if (!isEditing) fieldsToValidate.unshift('volunteerId');
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    setTouched({ volunteerId: true, activityTitle: true, description: true, pointsAwarded: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        ...formData,
        activityTitle: formData.activityTitle.trim(),
        description: formData.description.trim(),
        pointsAwarded: parseInt(formData.pointsAwarded),
      };
      if (isEditing) delete submitData.volunteerId;
      onSubmit(submitData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const getBadgePreview = () => {
    const pts = parseInt(formData.pointsAwarded);
    if (isNaN(pts) || pts < 0) return null;
    if (pts >= 1000) return 'Gold';
    if (pts >= 500) return 'Silver';
    return 'Bronze';
  };

  const getLevelPreview = () => {
    const pts = parseInt(formData.pointsAwarded);
    if (isNaN(pts) || pts < 0) return null;
    if (pts >= 750) return 'Advanced';
    if (pts >= 250) return 'Intermediate';
    return 'Beginner';
  };

  const getInputClass = (fieldName) => {
    const base =
      'w-full px-4 py-3 bg-slate-800 border rounded-lg text-sm font-medium text-white placeholder:text-slate-500 transition-colors duration-150 focus:outline-none';
    if (errors[fieldName] && touched[fieldName])
      return `${base} border-red-600 focus:border-red-500`;
    if (touched[fieldName] && !errors[fieldName] && formData[fieldName])
      return `${base} border-teal-600 focus:border-teal-500`;
    return `${base} border-slate-700 focus:border-teal-500`;
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-auto shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-teal-400 text-[10px] font-bold uppercase tracking-widest mb-1">
            <Sparkles size={11} /> Achievement System
          </div>
          <h2 className="text-lg font-bold text-white">
            {isEditing ? 'Update Achievement' : 'New Achievement'}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Volunteer Selection */}
          {!isEditing ? (
            <div>
              <label htmlFor="volunteer-select" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                <UserIcon size={11} /> Select Volunteer <span className="text-red-500">*</span>
              </label>
              {volunteers.length > 0 ? (
                <div className="relative">
                  <select
                    id="volunteer-select"
                    name="volunteerId"
                    value={formData.volunteerId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${getInputClass('volunteerId')} appearance-none cursor-pointer pr-10`}
                    disabled={isLoading}
                  >
                    <option value="">Choose a volunteer...</option>
                    {volunteers.map(vol => (
                      <option key={vol._id} value={vol._id}>
                        {vol.name}{vol.contact ? ` — ${vol.contact}` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" size={15} />
                </div>
              ) : (
                <div className="p-3.5 bg-amber-950/40 border border-amber-700/50 rounded-lg flex items-center gap-2.5">
                  <AlertCircle size={16} className="text-amber-400 shrink-0" />
                  <p className="text-xs font-medium text-amber-300">No volunteers available. Please add volunteers first.</p>
                </div>
              )}
              {errors.volunteerId && touched.volunteerId && (
                <p className="mt-1.5 text-xs font-medium text-red-400 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.volunteerId}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Volunteer</p>
                <p className="text-sm font-semibold text-white">{initialData.volunteerId?.name || 'Unknown'}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-teal-900/60 border border-teal-700/50 flex items-center justify-center text-teal-400">
                <ShieldCheck size={18} />
              </div>
            </div>
          )}

          {/* Mission Title */}
          <div>
            <label htmlFor="activity-title" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              <Activity size={11} /> Mission Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="activity-title"
                type="text"
                name="activityTitle"
                value={formData.activityTitle}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('activityTitle')}
                placeholder="e.g., Beach Cleanup Drive"
                disabled={isLoading}
                maxLength={100}
              />
              {touched.activityTitle && !errors.activityTitle && formData.activityTitle && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500" size={15} />
              )}
            </div>
            <div className="flex justify-between mt-1.5">
              {errors.activityTitle && touched.activityTitle ? (
                <p className="text-xs font-medium text-red-400 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.activityTitle}
                </p>
              ) : <span />}
              <span className="text-[11px] text-slate-600">{formData.activityTitle.length}/100</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="mission-desc" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              <FileText size={11} /> Mission Details <span className="text-red-500">*</span>
            </label>
            <textarea
              id="mission-desc"
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
              className={`${getInputClass('description')} resize-none`}
              placeholder="Describe the volunteer's contribution and impact..."
              disabled={isLoading}
              maxLength={500}
            />
            <div className="flex justify-between mt-1.5">
              {errors.description && touched.description ? (
                <p className="text-xs font-medium text-red-400 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.description}
                </p>
              ) : <span />}
              <span className="text-[11px] text-slate-600">{formData.description.length}/500</span>
            </div>
          </div>

          {/* Points & Badge */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="points-input" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                <TrendingUp size={11} /> Points <span className="text-red-500">*</span>
              </label>
              <input
                id="points-input"
                type="number"
                name="pointsAwarded"
                value={formData.pointsAwarded}
                onChange={handleChange}
                onBlur={handleBlur}
                min="0"
                max="10000"
                className={getInputClass('pointsAwarded')}
                placeholder="0"
                disabled={isLoading}
              />
              {errors.pointsAwarded && touched.pointsAwarded && (
                <p className="mt-1.5 text-xs font-medium text-red-400 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.pointsAwarded}
                </p>
              )}
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                <AwardIcon size={11} /> Badge
              </label>
              <div className="relative">
                <select
                  name="badgeType"
                  value={formData.badgeType}
                  onChange={handleChange}
                  className={`${getInputClass('badgeType')} appearance-none cursor-pointer pr-10`}
                  disabled={isLoading}
                >
                  <option value="">Auto</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" size={15} />
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          {getBadgePreview() && formData.pointsAwarded > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge type={formData.badgeType || getBadgePreview()} size="sm" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tier</p>
                  <p className="text-sm font-semibold text-white">{getLevelPreview()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-white tabular-nums">+{parseInt(formData.pointsAwarded || 0).toLocaleString()}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Points</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isLoading || (volunteers.length === 0 && !isEditing)}
              className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={15} />
                  {isEditing ? 'Update Achievement' : 'Create Achievement'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 py-3 rounded-lg font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AchievementForm;
