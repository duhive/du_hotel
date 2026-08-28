import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MEMBERS, PARTNER_MEMBERS } from '../constants';
import { Member } from '../types';
import { X, Mail, GraduationCap, Briefcase, Award, Users, Plus, Trash, Edit } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const Members = () => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('GENERATIONS');
  const [selectedFilter, setSelectedFilter] = useState<string>('전체');
  const [isCaptured, setIsCaptured] = useState(false);

  // Capture & Print Protection
  useEffect(() => {
    const triggerBlank = () => {
      setIsCaptured(true);
      document.body.classList.add('screen-captured');
      setTimeout(() => {
        setIsCaptured(false);
        document.body.classList.remove('screen-captured');
      }, 3000);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' ||
        e.keyCode === 44 ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'S' || e.key === 's' || e.key === '4' || e.key === '3')) ||
        ((e.metaKey || e.ctrlKey) && (e.key === 'p' || e.key === 'P'))
      ) {
        triggerBlank();
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        setIsCaptured(true);
        document.body.classList.add('screen-captured');
      } else {
        setTimeout(() => {
          setIsCaptured(false);
          document.body.classList.remove('screen-captured');
        }, 1500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Load dynamic custom members from Firestore
  const [customMembers, setCustomMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Form & action state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Password Verification Modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [pendingAction, setPendingAction] = useState<'create' | { type: 'edit'; member: Member } | { type: 'delete'; member: Member } | null>(null);

  // Form states for adding/editing members
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formCategory, setFormCategory] = useState<'GENERATIONS' | 'PARTNERS'>('GENERATIONS');
  const [formSubFilter, setFormSubFilter] = useState('2기');
  const [formImage, setFormImage] = useState('https://i.ibb.co/TGvX4D7/28.png');
  const [formBio, setFormBio] = useState('');
  const [formEducation, setFormEducation] = useState('');
  const [formSkills, setFormSkills] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formIsAlumni, setFormIsAlumni] = useState(false);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const generations = ['전체', '0-1기', '2기'];
  const partnerFilters = ['Global Service Group', 'Tourism & AI Group'];

  const fetchCustomMembers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'customMembers'));
      const membersList: Member[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        membersList.push({
          id: doc.id,
          name: data.name,
          role: data.role,
          category: data.category,
          subFilter: data.subFilter || '',
          image: data.image,
          bio: data.bio || '',
          education: data.education,
          skills: data.skills || [],
          contact: data.contact,
          isAlumni: data.isAlumni || false,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
        } as unknown as Member);
      });
      
      membersList.sort((a, b) => {
        const dateA = (a as any).createdAt instanceof Date ? (a as any).createdAt.getTime() : 0;
        const dateB = (b as any).createdAt instanceof Date ? (b as any).createdAt.getTime() : 0;
        return dateB - dateA;
      });
      
      setCustomMembers(membersList);
    } catch (err) {
      console.error("Error fetching custom members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomMembers();
  }, []);

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === '2405') {
      setIsPasswordModalOpen(false);
      setPasswordInput('');
      setPasswordError(false);

      if (pendingAction === 'create') {
        setEditingMember(null);
        setFormName('');
        setFormRole('');
        setFormCategory('GENERATIONS');
        setFormSubFilter('2기');
        setFormImage('https://i.ibb.co/TGvX4D7/28.png');
        setFormBio('');
        setFormEducation('');
        setFormSkills('');
        setFormContact('');
        setFormIsAlumni(false);
        setFormError(null);
        setIsFormOpen(true);
      } else if (pendingAction && pendingAction.type === 'edit') {
        const m = pendingAction.member;
        setEditingMember(m);
        setFormName(m.name);
        setFormRole(m.role);
        setFormCategory((m as any).groupType === 'GENERATIONS' ? 'GENERATIONS' : 'PARTNERS');
        setFormSubFilter((m as any).subFilter || '2기');
        setFormImage(m.image || 'https://i.ibb.co/TGvX4D7/28.png');
        setFormBio(m.bio || '');
        setFormEducation(m.education);
        setFormSkills(m.skills.join(', '));
        setFormContact(m.contact);
        setFormIsAlumni(m.isAlumni || false);
        setFormError(null);
        setIsFormOpen(true);
      } else if (pendingAction && pendingAction.type === 'delete') {
        handleDeleteMember(pendingAction.member.id);
      }
      setPendingAction(null);
    } else {
      setPasswordError(true);
    }
  };

  const handleDeleteMember = async (memberId: string | number) => {
    try {
      await deleteDoc(doc(db, 'customMembers', String(memberId)));
      setSelectedMember(null);
      fetchCustomMembers();
    } catch (err) {
      console.error("Error deleting member:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleSubmitMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRole.trim() || !formEducation.trim() || !formContact.trim()) {
      setFormError('필수 입력 항목을 모두 작성해 주세요.');
      return;
    }

    setFormLoading(true);
    setFormError(null);

    const skillsArray = formSkills
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const finalCategory = formCategory === 'GENERATIONS' ? 'GENERATIONS' : formSubFilter;
    const finalSubFilter = formCategory === 'GENERATIONS' ? formSubFilter : '';

    const memberData = {
      name: formName.trim(),
      role: formRole.trim(),
      category: finalCategory,
      subFilter: finalSubFilter,
      image: formImage.trim() || 'https://i.ibb.co/TGvX4D7/28.png',
      bio: formBio.trim(),
      education: formEducation.trim(),
      skills: skillsArray,
      contact: formContact.trim(),
      isAlumni: formIsAlumni,
    };

    try {
      if (editingMember) {
        const memberRef = doc(db, 'customMembers', String(editingMember.id));
        await updateDoc(memberRef, {
          ...memberData
        });
        
        setSelectedMember({
          id: editingMember.id,
          ...memberData,
          category: formCategory === 'GENERATIONS' ? undefined : finalCategory
        } as unknown as Member);
      } else {
        await addDoc(collection(db, 'customMembers'), {
          ...memberData,
          createdAt: new Date()
        });
      }
      setIsFormOpen(false);
      fetchCustomMembers();
    } catch (err) {
      console.error("Error saving member:", err);
      setFormError('저장하는 중 오류가 발생했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  const staticGenerations = MEMBERS.map(m => ({
    ...m,
    groupType: 'GENERATIONS' as const,
    subFilter: '0-1기'
  }));

  const staticPartners = PARTNER_MEMBERS.map(m => ({
    ...m,
    groupType: 'PARTNERS' as const,
    subFilter: m.category || ''
  }));

  const mappedCustomMembers = customMembers.map(m => {
    const isGen = m.category === 'GENERATIONS';
    return {
      ...m,
      groupType: isGen ? ('GENERATIONS' as const) : ('PARTNERS' as const),
      subFilter: isGen ? ((m as any).subFilter || '2기') : (m.category || ''),
      category: isGen ? undefined : m.category
    };
  });

  const allMembersList = [
    ...staticGenerations,
    ...staticPartners,
    ...mappedCustomMembers
  ];

  const filteredMembers = allMembersList.filter(m => {
    if (selectedCategory === 'GENERATIONS') {
      if (m.groupType !== 'GENERATIONS') return false;
      if (selectedFilter === '전체') return true;
      return m.subFilter === selectedFilter;
    } else {
      if (m.groupType !== 'PARTNERS') return false;
      return m.subFilter === selectedFilter;
    }
  }).slice().sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  const isComingSoon = filteredMembers.length === 0;

  return (
    <section id="members" className="py-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 relative">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-2 text-hive-green">Members</h2>
          <p className="text-navy-900/60 max-w-2xl mx-auto">
            {selectedCategory === 'GENERATIONS' 
              ? "HIVE를 이끄는 핵심 멤버들을 소개합니다. 각 분야의 전문성을 바탕으로 시너지를 창출합니다."
              : selectedFilter === 'Global Service Group'
                ? "글로벌 서비스 그룹은 CX, 서비스 혁신, 서비스 디자인 등을 분석하고 이를 바탕으로 새로운 서비스 모델을 기획하는 그룹입니다."
                : selectedFilter === 'Tourism & AI Group'
                  ? "투어리즘 & AI 그룹은 관광 서비스 산업에 최신 인공지능 기술과 데이터 분석을 융합하여 혁신적인 스마트관광 솔루션을 연구하는 연구 그룹입니다."
                  : "융합 역량 강화를 위해 함께하는 졸업생 및 타 분야 전공 학생들로 구성된 파트너 네트워크입니다."}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filter */}
          <div className="w-full lg:w-48 flex-shrink-0">
            <div className="sticky top-32 space-y-10">
              {/* Generations Section */}
              <div>
                <h3 className="text-sm font-bold text-navy-900/40 uppercase tracking-widest mb-6">Generations</h3>
                <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
                  {generations.map((gen) => (
                    <button
                      key={gen}
                      onClick={() => {
                        setSelectedCategory('GENERATIONS');
                        setSelectedFilter(gen);
                      }}
                      className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap text-left cursor-pointer ${
                        selectedCategory === 'GENERATIONS' && selectedFilter === gen
                          ? 'bg-hive-green text-white shadow-lg shadow-hive-green/20'
                          : 'bg-navy-900/5 text-navy-900/60 hover:bg-navy-900/10'
                      }`}
                    >
                      {gen}
                    </button>
                  ))}
                </div>
              </div>

              {/* Partners Section */}
              {partnerFilters.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-navy-900/40 uppercase tracking-widest mb-6">Partners</h3>
                  <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
                    {partnerFilters.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => {
                          setSelectedCategory('PARTNERS');
                          setSelectedFilter(filter);
                        }}
                        className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap text-left cursor-pointer ${
                          selectedCategory === 'PARTNERS' && selectedFilter === filter
                            ? 'bg-hive-green text-white shadow-lg shadow-hive-green/20'
                            : 'bg-navy-900/5 text-navy-900/60 hover:bg-navy-900/10'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Members Grid */}
          <div className="flex-grow">
            {isComingSoon ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-32 bg-navy-900/5 rounded-3xl border border-dashed border-navy-900/10"
              >
                <div className="w-16 h-16 bg-hive-green/10 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-hive-green" />
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-2">
                  {selectedCategory === 'PARTNERS' ? 'Partners Coming Soon' : '2기 모집 준비 중'}
                </h3>
                <p className="text-navy-900/60">곧 새로운 멤버들과 함께 찾아오겠습니다.</p>
              </motion.div>
            ) : (
              selectedCategory === 'GENERATIONS' ? (
                <div className="space-y-16">
                  {/* General Members */}
                  {filteredMembers.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-navy-900 mb-6 flex items-center gap-2 font-display">
                        <span className="w-1.5 h-6 bg-hive-green rounded-full block"></span>
                        HIVE 학회원
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMembers.map((member, i) => (
                          <motion.div
                            key={member.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => handleSelectMember(member)}
                            onContextMenu={(e) => e.preventDefault()}
                            className="cursor-pointer group relative aspect-[4/5] overflow-hidden rounded-2xl bg-white border border-navy-900/5 hover:shadow-lg transition-all duration-300 select-none"
                          >
                             {isCaptured ? (
                              <div className="w-full h-full bg-slate-100/90 flex items-center justify-center text-slate-400 font-mono text-[10px] select-none">
                                PROTECTED
                              </div>
                            ) : (
                              <img
                                src={member.image}
                                alt={member.name}
                                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 pointer-events-none select-none member-photo-protected"
                                referrerPolicy="no-referrer"
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = "https://i.ibb.co/TGvX4D7/28.png";
                                }}
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                            
                            <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform">
                              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span>{member.name}</span>
                                {member.isAlumni && (
                                  <span className="text-[9px] text-white bg-hive-green px-1.5 py-0.5 rounded font-bold uppercase tracking-wider select-none leading-none">
                                    Alumni
                                  </span>
                                )}
                              </h3>
                              <p className="text-white/80 text-[10px] font-medium uppercase tracking-widest mt-1">{member.education}</p>
                              <div className="h-0.5 w-0 group-hover:w-full bg-white/60 transition-all duration-300 mt-2" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Partner Group Description header */}
                  <div className="bg-navy-900/[0.02] border border-navy-900/5 rounded-2xl p-6 mb-8">
                    <h4 className="text-xl font-bold text-navy-900 mb-2 flex items-center gap-2 font-display">
                      <span className="w-1.5 h-6 bg-hive-green rounded-full block"></span>
                      {selectedFilter}
                    </h4>
                    <p className="text-sm text-navy-900/60 leading-relaxed">
                      {selectedFilter === 'Global Service Group'
                        ? "CX, 서비스 혁신, 서비스 디자인 분야를 다각도로 분석하고, 최신 트렌드를 반영한 실무 중심의 서비스 모델을 직접 기획하고 설계합니다."
                        : selectedFilter === 'Tourism & AI Group'
                          ? "데이터 분석과 인공지능(AI) 기술을 전통적인 관광/로컬 문화 콘텐츠에 융합하여 미래 지향적인 스마트관광 솔루션을 연구합니다."
                          : "HIVE의 시너지 창출과 역량 강화를 위해 함께 협업하는 파트너 네트워크입니다."}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMembers.map((member, i) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleSelectMember(member)}
                        onContextMenu={(e) => e.preventDefault()}
                        className="cursor-pointer group relative aspect-[4/5] overflow-hidden rounded-2xl bg-white border border-navy-900/5 select-none"
                      >
                        {isCaptured ? (
                          <div className="w-full h-full bg-slate-100/90 flex items-center justify-center text-slate-400 font-mono text-[10px] select-none">
                            PROTECTED
                          </div>
                        ) : (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 pointer-events-none select-none member-photo-protected"
                            referrerPolicy="no-referrer"
                            draggable={false}
                            onContextMenu={(e) => e.preventDefault()}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "https://i.ibb.co/TGvX4D7/28.png";
                            }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                        
                        <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform">
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>{member.name}</span>
                            {member.isAlumni && (
                              <span className="text-[9px] text-white bg-hive-green px-1.5 py-0.5 rounded font-bold uppercase tracking-wider select-none leading-none">
                                Alumni
                              </span>
                            )}
                          </h3>
                          <p className="text-white/80 text-[10px] font-medium uppercase tracking-widest mt-1">
                            {member.education || member.role}
                          </p>
                          <div className="h-0.5 w-0 group-hover:w-full bg-white/60 transition-all duration-300 mt-2" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Member Detail Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl overflow-y-auto md:overflow-hidden shadow-2xl border border-navy-900/10 flex flex-col md:flex-row h-auto"
            >
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-navy-900/40 hover:bg-red-50/10 hover:text-red-500 transition-colors shadow-sm cursor-pointer"
              >
                <X size={18} />
              </button>

              <div 
                className="w-full md:w-2/5 aspect-[4/5] md:aspect-[3/4] self-start relative bg-white border-b md:border-b-0 md:border-r border-navy-900/5 flex-shrink-0 select-none overflow-hidden"
                onContextMenu={(e) => e.preventDefault()}
              >
                {isCaptured ? (
                  <div className="w-full h-full bg-slate-100/90 flex items-center justify-center text-slate-400 font-mono text-xs select-none">
                    PROTECTED
                  </div>
                ) : (
                  <img
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    className="w-full h-full object-cover pointer-events-none select-none member-photo-protected"
                    referrerPolicy="no-referrer"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://i.ibb.co/TGvX4D7/28.png";
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-transparent select-none pointer-events-auto" onContextMenu={(e) => e.preventDefault()} />
              </div>

              <div className="w-full md:w-3/5 p-6 md:p-10 flex flex-col justify-start md:max-h-[90vh] md:overflow-y-auto">
                <div className="mb-5">
                  <div className="flex items-center gap-3">
                    <h2 className="text-4xl font-display font-bold text-navy-900">{selectedMember.name}</h2>
                    {selectedMember.isAlumni && (
                      <span className="text-[10px] text-white bg-hive-green px-2 py-0.5 rounded font-bold uppercase tracking-wider select-none">
                        Alumni
                      </span>
                    )}
                  </div>
                  {selectedMember.category && (
                    <span className="text-hive-green font-bold uppercase tracking-[0.2em] text-xs mt-1 block">
                      {selectedMember.role}
                    </span>
                  )}
                </div>

                 <div className="space-y-6">
                  {selectedMember.bio && (
                    <section className="bg-navy-900/5 p-4 rounded-2xl border border-navy-900/5">
                      <p className="text-navy-900/80 text-sm leading-relaxed italic">
                        "{selectedMember.bio}"
                      </p>
                    </section>
                  )}

                  <section>
                    <div className="flex items-center space-x-2 text-hive-green mb-3">
                      {selectedMember.category ? (
                        <>
                          <GraduationCap size={18} />
                          <h4 className="font-bold uppercase tracking-widest text-xs text-navy-900/40">Education</h4>
                        </>
                      ) : (
                        <>
                          <Briefcase size={18} />
                          <h4 className="font-bold uppercase tracking-widest text-xs text-navy-900/40">Role</h4>
                        </>
                      )}
                    </div>
                    <div className="text-navy-900/80 leading-relaxed font-normal flex flex-wrap items-center gap-2">
                      <span>{selectedMember.category ? selectedMember.education : selectedMember.role}</span>
                      {!selectedMember.category && (
                        <span className="text-xs text-navy-900/50 bg-navy-900/5 border border-navy-900/10 px-2 py-0.5 rounded font-medium">
                          {selectedMember.education}
                        </span>
                      )}
                    </div>
                  </section>

                  <div className="grid grid-cols-1 gap-6">
                    <section>
                      <div className="flex items-center space-x-2 text-hive-green mb-3">
                        <Award size={18} />
                        <h4 className="font-bold uppercase tracking-widest text-xs text-navy-900/40">INTERESTS</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.skills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-navy-900/5 text-navy-900/70 text-[10px] font-bold rounded-full border border-navy-900/10 uppercase">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>

                    <section>
                      <div className="flex items-center space-x-2 text-hive-green mb-3">
                        <Mail size={18} />
                        <h4 className="font-bold uppercase tracking-widest text-xs text-navy-900/40">Contact</h4>
                      </div>
                      <p className="text-navy-900/70 text-sm break-all font-mono">{selectedMember.contact}</p>
                    </section>

                  </div>

                  {typeof selectedMember.id === 'string' && (
                    <div className="flex gap-3 pt-6 border-t border-navy-900/10 mt-6">
                      <button
                        onClick={() => {
                          setPendingAction({ type: 'edit', member: selectedMember });
                          setIsPasswordModalOpen(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 bg-navy-900/5 hover:bg-navy-900/10 text-navy-900/70 border border-navy-900/10 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Edit size={13} />
                        프로필 수정
                      </button>
                      <button
                        onClick={() => {
                          setPendingAction({ type: 'delete', member: selectedMember });
                          setIsPasswordModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-1.5 py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Trash size={13} />
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Password Prompt Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[150] flex items-center justify-center p-4"
            onClick={() => {
              setIsPasswordModalOpen(false);
              setPasswordInput('');
              setPasswordError(false);
              setPendingAction(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border border-gray-100 p-6 max-w-sm w-full shadow-xl space-y-4"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-center">
                <h3 className="text-lg font-bold text-gray-900 font-sans">멤버 프로필 관리 권한</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-sans">
                  멤버 프로필을 등록, 수정 또는 삭제하려면<br />
                  학회 전용 비밀번호를 입력해 주세요.
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <input
                    type="password"
                    placeholder="비밀번호 입력"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePasswordSubmit();
                      }
                    }}
                    className={`w-full px-4 py-2.5 border rounded-xl text-center text-sm font-bold tracking-widest focus:outline-hidden focus:ring-2 focus:ring-hive-green/20 ${
                      passwordError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-hive-green'
                    }`}
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-center text-[10px] text-red-500 font-bold mt-1.5">비밀번호가 일치하지 않습니다.</p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPasswordModalOpen(false);
                      setPasswordInput('');
                      setPasswordError(false);
                      setPendingAction(null);
                    }}
                    className="flex-1 py-2 px-4 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handlePasswordSubmit}
                    className="flex-1 py-2 px-4 bg-hive-green hover:bg-hive-green/90 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    확인
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Member Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[140] flex items-center justify-center p-4 md:p-8"
            onClick={() => setIsFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 font-sans">
                  {editingMember ? '멤버 프로필 수정' : '새 멤버 프로필 등록'}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors cursor-pointer animate-none"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitMember} className="space-y-5">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">이름 *</label>
                    <input
                      type="text"
                      required
                      placeholder="예: 강경임"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-hive-green/20 focus:border-hive-green"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">역할 / 직책 *</label>
                    <input
                      type="text"
                      required
                      placeholder="예: 2기 YB, 학회장, Partner 등"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-hive-green/20 focus:border-hive-green"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">분류 *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => {
                        const val = e.target.value as 'GENERATIONS' | 'PARTNERS';
                        setFormCategory(val);
                        setFormSubFilter(val === 'GENERATIONS' ? '2기' : 'Global Service Group');
                      }}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-hive-green/20 focus:border-hive-green bg-white"
                    >
                      <option value="GENERATIONS">HIVE 학회원 (Generations)</option>
                      <option value="PARTNERS">파트너 (Partners)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">상세 그룹 *</label>
                    {formCategory === 'GENERATIONS' ? (
                      <select
                        value={formSubFilter}
                        onChange={(e) => setFormSubFilter(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-hive-green/20 focus:border-hive-green bg-white"
                      >
                        <option value="0-1기">0-1기</option>
                        <option value="2기">2기</option>
                      </select>
                    ) : (
                      <select
                        value={formSubFilter}
                        onChange={(e) => setFormSubFilter(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-hive-green/20 focus:border-hive-green bg-white"
                      >
                        <option value="Global Service Group">Global Service Group</option>
                        <option value="Tourism & AI Group">Tourism & AI Group</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">소속 학과 / 소속 *</label>
                    <input
                      type="text"
                      required
                      placeholder="예: 호텔외식관광학과"
                      value={formEducation}
                      onChange={(e) => setFormEducation(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-hive-green/20 focus:border-hive-green"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">연락처 *</label>
                    <input
                      type="text"
                      required
                      placeholder="예: example@naver.com"
                      value={formContact}
                      onChange={(e) => setFormContact(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-hive-green/20 focus:border-hive-green"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">프로필 사진 URL *</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      required
                      placeholder="이미지 웹 주소 (URL)"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-hive-green/20 focus:border-hive-green"
                    />
                    <button
                      type="button"
                      onClick={() => setFormImage('https://i.ibb.co/TGvX4D7/28.png')}
                      className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-50 text-gray-500 transition-colors cursor-pointer"
                    >
                      기본 이미지
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">전문 분야 / 관심사 (쉼표로 구분)</label>
                  <input
                    type="text"
                    placeholder="예: 호텔경영, 관광마케팅, 인공지능 등"
                    value={formSkills}
                    onChange={(e) => setFormSkills(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-hive-green/20 focus:border-hive-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">소개글 *</label>
                  <textarea
                    required
                    placeholder="자신을 소개하는 한 줄 소개글을 적어주세요."
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-hive-green/20 focus:border-hive-green resize-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="formIsAlumni"
                    checked={formIsAlumni}
                    onChange={(e) => setFormIsAlumni(e.target.checked)}
                    className="rounded border-gray-300 text-hive-green focus:ring-hive-green cursor-pointer"
                  />
                  <label htmlFor="formIsAlumni" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                    졸업생 (Alumni) 여부
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 py-2.5 bg-hive-green hover:bg-hive-green/90 disabled:bg-hive-green/50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {formLoading ? '저장 중...' : editingMember ? '수정 완료' : '등록 완료'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Members;
