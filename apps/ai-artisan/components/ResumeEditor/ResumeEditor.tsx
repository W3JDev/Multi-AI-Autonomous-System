'use client';

import { useState } from 'react';
import type { ResumeContent, WorkExperience, Education } from '@/lib/types';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';

interface ResumeEditorProps {
  data: ResumeContent;
  onChange: (data: ResumeContent) => void;
}

export function ResumeEditor({ data, onChange }: ResumeEditorProps) {
  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value },
    });
  };

  const addExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      description: [''],
    };
    onChange({ ...data, experience: [...data.experience, newExp] });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    onChange({
      ...data,
      experience: data.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...data,
      experience: data.experience.filter(exp => exp.id !== id),
    });
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      startDate: '',
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const updateEducation = (id: string, field: string, value: any) => {
    onChange({
      ...data,
      education: data.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...data,
      education: data.education.filter(edu => edu.id !== id),
    });
  };

  const updateSkills = (skillsText: string) => {
    const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean);
    onChange({ ...data, skills });
  };

  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={data.personalInfo.name}
              onChange={(e) => updatePersonalInfo('name', e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={data.personalInfo.email}
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
              placeholder="john@example.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={data.personalInfo.phone}
              onChange={(e) => updatePersonalInfo('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={data.personalInfo.location || ''}
              onChange={(e) => updatePersonalInfo('location', e.target.value)}
              placeholder="San Francisco, CA"
            />
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={data.personalInfo.linkedin || ''}
              onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
              placeholder="linkedin.com/in/johndoe"
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={data.personalInfo.website || ''}
              onChange={(e) => updatePersonalInfo('website', e.target.value)}
              placeholder="johndoe.com"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="summary">Professional Summary</Label>
          <textarea
            id="summary"
            className="w-full min-h-[100px] p-2 border rounded-md"
            value={data.personalInfo.summary || ''}
            onChange={(e) => updatePersonalInfo('summary', e.target.value)}
            placeholder="Brief professional summary..."
          />
        </div>
      </section>

      {/* Work Experience */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Work Experience</h3>
          <Button onClick={addExperience}>Add Experience</Button>
        </div>
        {data.experience.map((exp, index) => (
          <div key={exp.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Experience #{index + 1}</span>
              <Button variant="destructive" size="sm" onClick={() => removeExperience(exp.id)}>
                Remove
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Position *</Label>
                <Input
                  value={exp.position}
                  onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
              <div>
                <Label>Company *</Label>
                <Input
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                  placeholder="Tech Corp"
                />
              </div>
              <div>
                <Label>Start Date *</Label>
                <Input
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                  placeholder="Jan 2020"
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  value={exp.endDate || ''}
                  onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                  placeholder="Present"
                  disabled={exp.current}
                />
                <label className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    checked={exp.current || false}
                    onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                    className="mr-2"
                  />
                  Current Position
                </label>
              </div>
            </div>
            <div>
              <Label>Description (one per line)</Label>
              <textarea
                className="w-full min-h-[100px] p-2 border rounded-md"
                value={exp.description.join('\n')}
                onChange={(e) =>
                  updateExperience(exp.id, 'description', e.target.value.split('\n'))
                }
                placeholder="• Led development of..."
              />
            </div>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Education</h3>
          <Button onClick={addEducation}>Add Education</Button>
        </div>
        {data.education.map((edu, index) => (
          <div key={edu.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Education #{index + 1}</span>
              <Button variant="destructive" size="sm" onClick={() => removeEducation(edu.id)}>
                Remove
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Degree *</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                  placeholder="Bachelor of Science"
                />
              </div>
              <div>
                <Label>School *</Label>
                <Input
                  value={edu.school}
                  onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                  placeholder="University of..."
                />
              </div>
              <div>
                <Label>Field of Study</Label>
                <Input
                  value={edu.field || ''}
                  onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                  placeholder="Computer Science"
                />
              </div>
              <div>
                <Label>GPA</Label>
                <Input
                  value={edu.gpa || ''}
                  onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                  placeholder="3.8/4.0"
                />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  value={edu.startDate}
                  onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                  placeholder="2016"
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  value={edu.endDate || ''}
                  onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                  placeholder="2020"
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Skills</h3>
        <div>
          <Label htmlFor="skills">Skills (comma-separated)</Label>
          <textarea
            id="skills"
            className="w-full min-h-[80px] p-2 border rounded-md"
            value={data.skills.join(', ')}
            onChange={(e) => updateSkills(e.target.value)}
            placeholder="JavaScript, React, Node.js, Python, AWS"
          />
        </div>
      </section>
    </div>
  );
}
