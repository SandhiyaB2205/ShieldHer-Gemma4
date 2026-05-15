'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Phone, Mail, Trash2, UserPlus, Loader2, Heart } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { GlassmorphismCard } from '@/components/layout/glassmorphism-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { FadeIn } from '@/components/shared/page-transition';
import { ListSkeleton } from '@/components/shared/skeleton-loader';
import toast from 'react-hot-toast';
import type { EmergencyContact } from '@/types';

const RELATION_OPTIONS = ['Parent', 'Spouse', 'Sibling', 'Friend', 'Other'];

export default function ContactsPage() {
  const { getAuthHeaders } = useAuth();
  
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relation, setRelation] = useState('Friend');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/emergency-contacts', {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addContact = async () => {
    if (!name || !phone || !email) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/emergency-contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ name, phone, email, relation }),
      });

      if (response.ok) {
        const data = await response.json();
        setContacts((prev) => [...prev, data.contact]);
        setShowForm(false);
        resetForm();
        toast.success('Contact added successfully');
      } else {
        throw new Error('Failed to add contact');
      }
    } catch (error) {
      console.error('Add contact error:', error);
      toast.error('Failed to add contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteContact = async (id: number) => {
    setDeletingId(id);

    try {
      const response = await fetch(`/api/emergency-contacts?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setContacts((prev) => prev.filter((c) => c.id !== id));
        toast.success('Contact removed');
      } else {
        throw new Error('Failed to delete contact');
      }
    } catch (error) {
      console.error('Delete contact error:', error);
      toast.error('Failed to remove contact');
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setRelation('Friend');
  };

  return (
    <div className="min-h-screen">
      <Header title="Emergency Contacts" />

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Info Card */}
        <FadeIn>
          <GlassmorphismCard variant="subtle" className="border-primary/30">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Your Safety Network</h3>
                <p className="text-sm text-muted-foreground">
                  These contacts will be notified automatically when you trigger an SOS alert.
                </p>
              </div>
            </div>
          </GlassmorphismCard>
        </FadeIn>

        {/* Add Contact Button */}
        <FadeIn delay={0.05}>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="w-full bg-gradient-to-r from-primary to-primary/80"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Emergency Contact
          </Button>
        </FadeIn>

        {/* Add Contact Form */}
        {showForm && (
          <FadeIn>
            <GlassmorphismCard variant="strong" className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                New Contact
              </h3>

              <div className="space-y-3">
                <Input
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background/50"
                />
                
                <Input
                  placeholder="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-background/50"
                />
                
                <Input
                  placeholder="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50"
                />

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Relationship</label>
                  <div className="flex flex-wrap gap-2">
                    {RELATION_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setRelation(opt)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          relation === opt
                            ? 'bg-primary text-white'
                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addContact}
                  disabled={isSubmitting}
                  className="flex-1 bg-primary"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Contact'
                  )}
                </Button>
              </div>
            </GlassmorphismCard>
          </FadeIn>
        )}

        {/* Contacts List */}
        <FadeIn delay={0.1}>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Your Contacts ({contacts.length})
          </h3>
        </FadeIn>

        {isLoading ? (
          <ListSkeleton count={3} />
        ) : contacts.length === 0 ? (
          <FadeIn delay={0.2}>
            <GlassmorphismCard variant="subtle" className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No emergency contacts yet. Add someone you trust.
              </p>
            </GlassmorphismCard>
          </FadeIn>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassmorphismCard>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-lg font-bold text-foreground">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{contact.name}</h4>
                        <p className="text-xs text-primary">{contact.relation}</p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteContact(contact.id)}
                      disabled={deletingId === contact.id}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      {deletingId === contact.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      {contact.phone}
                    </a>
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <Mail className="w-3 h-3" />
                      {contact.email}
                    </a>
                  </div>
                </GlassmorphismCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
