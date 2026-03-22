import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ChevronRight, Layout, AtSign, User as UserIcon } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useWorkspaceStore from '../../store/workspaceStore';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    workspaceName: '',
    workspaceHandle: '',
    adminDisplayName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { updateProfile } = useAuthStore();
  const { requestWorkspace } = useWorkspaceStore();

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      
      // Update profile first
      await updateProfile({
        displayName: formData.adminDisplayName,
        onboarded: true
      });

      // Then request workspace
      const result = await requestWorkspace({
        name: formData.workspaceName,
        handle: formData.workspaceHandle
      });
      
      setIsSubmitting(false);
      if (result.success) {
        navigate('/home');
      }
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    await updateProfile({ onboarded: true });
    setIsSubmitting(false);
    navigate('/home');
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-brand-pink/10 p-4 rounded-3xl w-16 h-16 flex items-center justify-center mb-8">
              <Layout className="w-8 h-8 text-brand-pink" />
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              First, let's name your <span className="text-brand-pink">workspace</span>
            </h2>
            <p className="text-slate-500 text-lg">
              This is the name of your company, team, or organization.
            </p>
            <div className="relative">
              <input
                type="text"
                value={formData.workspaceName}
                onChange={(e) => updateFormData('workspaceName', e.target.value)}
                placeholder="e.g. Acorn Marketing"
                className="w-full bg-slate-100 border-none rounded-2xl p-5 text-lg focus:ring-2 focus:ring-brand-pink transition-all outline-none"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-brand-purple/10 p-4 rounded-3xl w-16 h-16 flex items-center justify-center mb-8">
              <AtSign className="w-8 h-8 text-brand-purple" />
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Create a <span className="text-brand-purple">handle</span>
            </h2>
            <p className="text-slate-500 text-lg">
              A unique identifier for your workspace URL.
            </p>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-medium">groupflow.com/</span>
              <input
                type="text"
                value={formData.workspaceHandle}
                onChange={(e) => updateFormData('workspaceHandle', e.target.value)}
                placeholder="acorn-marketing"
                className="w-full bg-slate-100 border-none rounded-2xl p-5 pl-[145px] text-lg focus:ring-2 focus:ring-brand-purple transition-all outline-none"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-blue-500/10 p-4 rounded-3xl w-16 h-16 flex items-center justify-center mb-8">
              <User className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              What's your <span className="text-blue-500">display name</span>?
            </h2>
            <p className="text-slate-500 text-lg">
              This is how you'll appear to your teammates.
            </p>
            <div className="relative">
              <input
                type="text"
                value={formData.adminDisplayName}
                onChange={(e) => updateFormData('adminDisplayName', e.target.value)}
                placeholder="e.g. Maya Park"
                className="w-full bg-slate-100 border-none rounded-2xl p-5 text-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 bg-brand-dark relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-pink opacity-20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-purple opacity-20 blur-[120px] rounded-full"></div>
        
        <div className="relative z-10 text-center space-y-8 max-w-md">
          <div className="inline-block p-4 glass-dark rounded-3xl mb-4">
             <h1 className="text-3xl font-black text-white tracking-tighter">GroupFlow</h1>
          </div>
          <h3 className="text-4xl font-bold text-white leading-tight">
            Build a better workspace for your team.
          </h3>
          <p className="text-slate-400 text-xl font-medium">
            Join thousands of teams getting more done with GroupFlow.
          </p>
        </div>

        {/* Floating Elements Mockup */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
           <div className="absolute top-20 right-20 glass-dark p-4 rounded-2xl animate-float" style={{ animationDelay: '1s' }}>
              <div className="w-32 h-3 bg-slate-700 rounded-full mb-2"></div>
              <div className="w-20 h-3 bg-slate-700 rounded-full"></div>
           </div>
           <div className="absolute bottom-40 left-20 glass-dark p-4 rounded-2xl animate-float" style={{ animationDelay: '3s' }}>
              <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 rounded-full bg-brand-pink/50"></div>
                 <div className="space-y-2">
                    <div className="w-24 h-3 bg-slate-700 rounded-full"></div>
                    <div className="w-16 h-3 bg-slate-700 rounded-full"></div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col p-8 md:p-20 justify-center bg-white relative">
        <div className="max-w-xl w-full mx-auto space-y-12">
          {/* Progress Bar */}
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-2 rounded-full transition-all duration-500 ${
                  s <= step ? 'w-12 bg-brand-pink' : 'w-4 bg-slate-100'
                }`}
              />
            ))}
          </div>

          <div className="min-h-[400px]">
            {renderStep()}
          </div>

          <div className="flex items-center justify-between pt-12">
            <button 
              onClick={handleSkip}
              className="text-slate-400 font-bold hover:text-slate-600 transition-colors text-lg px-4"
            >
              Skip for now
            </button>
            <button 
              onClick={handleNext}
              className="btn-primary flex items-center space-x-2 group"
            >
              <span className="text-lg">
                {step === 3 ? 'Get Started' : 'Continue'}
              </span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        
        {/* Decorative corner */}
        <div className="absolute bottom-0 right-0 p-8 text-slate-300 pointer-events-none">
           <p className="text-sm font-medium">© 2026 GroupFlow Inc.</p>
        </div>
      </div>
    </div>
  );
}
