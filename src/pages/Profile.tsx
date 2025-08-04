import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Phone, 
  Calendar, 
  Activity, 
  Heart, 
  Brain,
  Users,
  Stethoscope,
  AlertTriangle,
  Clock,
  Settings
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTemperature } from "@/contexts/TemperatureContext"

interface ExtendedProfile {
  id?: string
  user_id: string
  display_name: string | null
  emergency_contact: string | null
  alert_threshold: number | null
  // Extended fields (will be stored as JSON in emergency_contact field for now)
  full_name?: string
  age?: number
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  height?: number // Height in cm
  weight?: number // Weight in kg
  epilepsy_type?: string
  diagnosis_length?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  doctor_name?: string
  doctor_phone?: string
  doctor_email?: string
  medical_notes?: string
  created_at?: string
  updated_at?: string
}

export default function Profile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { unit, setUnit } = useTemperature()
  const [profile, setProfile] = useState<ExtendedProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [measurementSystem, setMeasurementSystem] = useState<'metric' | 'imperial'>('metric')
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm')
  const [heightFeet, setHeightFeet] = useState(0)
  const [heightInches, setHeightInches] = useState(0)
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
  const [weightPounds, setWeightPounds] = useState(0)

  // Form state for editing
  const [formData, setFormData] = useState<ExtendedProfile>({
    user_id: user?.id || '',
    display_name: '',
    emergency_contact: null,
    alert_threshold: 70,
    full_name: '',
    age: 0,
    gender: 'prefer_not_to_say',
    height: 0,
    weight: 0,
    epilepsy_type: '',
    diagnosis_length: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    doctor_name: '',
    doctor_phone: '',
    doctor_email: '',
    medical_notes: ''
  })

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        // Parse extended profile data from JSON stored in emergency_contact field
        let extendedData: any = {}
        try {
          if (data.emergency_contact && data.emergency_contact.startsWith('{')) {
            extendedData = JSON.parse(data.emergency_contact)
          }
        } catch (e) {
          // If not JSON, treat as simple emergency contact
          extendedData = { emergency_contact_phone: data.emergency_contact }
        }

        const profileData: ExtendedProfile = {
          ...data,
          ...extendedData
        }

        setProfile(profileData)
        setFormData(profileData)
        
        // Initialize measurement system based on current units
        const isImperial = unit === 'fahrenheit' || weightUnit === 'lbs' || heightUnit === 'ft'
        setMeasurementSystem(isImperial ? 'imperial' : 'metric')
        
        // Set height feet/inches for display
        if (profileData.height) {
          const { feet, inches } = cmToFeetInches(profileData.height)
          setHeightFeet(feet)
          setHeightInches(inches)
        }
        
        // Set weight pounds for display
        if (profileData.weight) {
          setWeightPounds(kgToPounds(profileData.weight))
        }
      } else {
        // No profile exists, user needs to create one
        setIsEditing(true)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: "Error",
        description: "Failed to load your profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Separate basic profile data from extended data
      const basicProfile = {
        display_name: formData.full_name || formData.display_name,
        alert_threshold: formData.alert_threshold,
      }

      // Store extended profile data as JSON in emergency_contact field
      const extendedData = {
        full_name: formData.full_name,
        age: formData.age,
        gender: formData.gender,
        height: formData.height,
        weight: formData.weight,
        epilepsy_type: formData.epilepsy_type,
        diagnosis_length: formData.diagnosis_length,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        doctor_name: formData.doctor_name,
        doctor_phone: formData.doctor_phone,
        doctor_email: formData.doctor_email,
        medical_notes: formData.medical_notes
      }

      const profileData = {
        ...basicProfile,
        emergency_contact: JSON.stringify(extendedData),
        user_id: user?.id,
        updated_at: new Date().toISOString()
      }

      let result
      if (profile?.id) {
        // Update existing profile
        result = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', profile.id)
          .select()
          .single()
      } else {
        // Create new profile
        result = await supabase
          .from('profiles')
          .insert([{ ...profileData, created_at: new Date().toISOString() }])
          .select()
          .single()
      }

      if (result.error) throw result.error

      // Combine the result with extended data for state
      const updatedProfile = {
        ...result.data,
        ...extendedData
      }

      setProfile(updatedProfile)
      setIsEditing(false)
      toast({
        title: "Success",
        description: profile?.id ? "Profile updated successfully!" : "Profile created successfully!",
      })
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData(profile)
    }
    setIsEditing(false)
  }

  const handleInputChange = (field: keyof ExtendedProfile, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMeasurementSystemChange = (system: 'metric' | 'imperial') => {
    setMeasurementSystem(system)
    
    // Update unit preferences
    setHeightUnit(system === 'imperial' ? 'ft' : 'cm')
    setWeightUnit(system === 'imperial' ? 'lbs' : 'kg')
    
    // Update temperature unit
    setUnit(system === 'imperial' ? 'fahrenheit' : 'celsius')
  }

  const calculateBMI = (height: number, weight: number): string => {
    if (!height || !weight || height <= 0 || weight <= 0) return 'N/A'
    const heightInMeters = height / 100
    const bmi = weight / (heightInMeters * heightInMeters)
    return bmi.toFixed(1)
  }

  const getBMICategory = (bmi: string): string => {
    if (bmi === 'N/A') return ''
    const bmiValue = parseFloat(bmi)
    if (bmiValue < 18.5) return 'Underweight'
    if (bmiValue < 25) return 'Normal'
    if (bmiValue < 30) return 'Overweight'
    return 'Obese'
  }

  // Height conversion functions
  const cmToFeetInches = (cm: number): { feet: number; inches: number } => {
    if (!cm || cm <= 0) return { feet: 0, inches: 0 }
    const totalInches = cm / 2.54
    const feet = Math.floor(totalInches / 12)
    const inches = Math.round(totalInches % 12)
    return { feet, inches }
  }

  const feetInchesToCm = (feet: number, inches: number): number => {
    return Math.round((feet * 12 + inches) * 2.54)
  }

  // Weight conversion functions
  const kgToPounds = (kg: number): number => {
    if (!kg || kg <= 0) return 0
    return Math.round(kg * 2.20462 * 10) / 10 // Round to 1 decimal place
  }

  const poundsToKg = (pounds: number): number => {
    if (!pounds || pounds <= 0) return 0
    return Math.round(pounds / 2.20462 * 10) / 10 // Round to 1 decimal place
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <User className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">Manage your personal and medical information</p>
            </div>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your basic personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                {isEditing ? (
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="p-2 bg-muted rounded-md">{profile?.full_name || 'Not provided'}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                {isEditing ? (
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="150"
                    value={formData.age === 0 ? '' : formData.age}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '') {
                        handleInputChange('age', 0)
                      } else {
                        const age = parseInt(value)
                        // Validate age is reasonable (1-150)
                        if (age >= 1 && age <= 150) {
                          handleInputChange('age', age)
                        } else if (age > 150) {
                          handleInputChange('age', 150)
                        } else if (age < 1) {
                          handleInputChange('age', 1)
                        }
                      }
                    }}
                    placeholder="Enter your age (1-150)"
                  />
                ) : (
                  <p className="p-2 bg-muted rounded-md">
                    {profile?.age && profile.age > 0 ? `${profile.age} years old` : 'Not provided'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                {isEditing ? (
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="p-2 bg-muted rounded-md capitalize">
                    {profile?.gender?.replace('_', ' ') || 'Not provided'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Account Email</Label>
                <p className="p-2 bg-muted rounded-md text-muted-foreground">
                  {user?.email || 'Not available'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                {isEditing ? (
                  <>
                    <div className="flex gap-2 mb-2">
                      <Button
                        type="button"
                        variant={heightUnit === 'cm' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setHeightUnit('cm')}
                      >
                        cm
                      </Button>
                      <Button
                        type="button"
                        variant={heightUnit === 'ft' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setHeightUnit('ft')}
                      >
                        ft/in
                      </Button>
                    </div>
                    {heightUnit === 'cm' ? (
                      <Input
                        id="height"
                        type="number"
                        min="50"
                        max="250"
                        value={formData.height === 0 ? '' : formData.height}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '') {
                            handleInputChange('height', 0)
                            setHeightFeet(0)
                            setHeightInches(0)
                          } else {
                            const cm = parseInt(value)
                            if (cm >= 50 && cm <= 250) {
                              handleInputChange('height', cm)
                              const { feet, inches } = cmToFeetInches(cm)
                              setHeightFeet(feet)
                              setHeightInches(inches)
                            } else if (cm > 250) {
                              handleInputChange('height', 250)
                              const { feet, inches } = cmToFeetInches(250)
                              setHeightFeet(feet)
                              setHeightInches(inches)
                            } else if (cm < 50 && cm > 0) {
                              handleInputChange('height', 50)
                              const { feet, inches } = cmToFeetInches(50)
                              setHeightFeet(feet)
                              setHeightInches(inches)
                            }
                          }
                        }}
                        placeholder="Enter height (50-250 cm)"
                      />
                    ) : (
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            type="number"
                            min="1"
                            max="8"
                            value={heightFeet === 0 ? '' : heightFeet}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === '') {
                                setHeightFeet(0)
                                const cm = feetInchesToCm(0, heightInches)
                                handleInputChange('height', cm)
                              } else {
                                const feet = parseInt(value)
                                if (!isNaN(feet)) {
                                  // Allow any reasonable value during typing, clamp to range
                                  const clampedFeet = Math.max(0, Math.min(8, feet))
                                  setHeightFeet(clampedFeet)
                                  const cm = feetInchesToCm(clampedFeet, heightInches)
                                  handleInputChange('height', cm)
                                }
                              }
                            }}
                            placeholder="Feet (1-8)"
                          />
                          <Label className="text-xs text-muted-foreground">feet</Label>
                        </div>
                        <div className="flex-1">
                          <Input
                            type="number"
                            min="0"
                            max="11"
                            value={heightInches === 0 ? '' : heightInches}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === '') {
                                setHeightInches(0)
                                const cm = feetInchesToCm(heightFeet, 0)
                                handleInputChange('height', cm)
                              } else {
                                const inches = parseInt(value)
                                if (!isNaN(inches)) {
                                  // Allow any reasonable value during typing, clamp to range
                                  const clampedInches = Math.max(0, Math.min(11, inches))
                                  setHeightInches(clampedInches)
                                  const cm = feetInchesToCm(heightFeet, clampedInches)
                                  handleInputChange('height', cm)
                                }
                              }
                            }}
                            placeholder="Inches (0-11)"
                          />
                          <Label className="text-xs text-muted-foreground">inches</Label>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="p-2 bg-muted rounded-md">
                    {profile?.height && profile.height > 0 ? (
                      <>
                        {profile.height} cm ({cmToFeetInches(profile.height).feet}'{cmToFeetInches(profile.height).inches}")
                      </>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                {isEditing ? (
                  <>
                    <div className="flex gap-2 mb-2">
                      <Button
                        type="button"
                        variant={weightUnit === 'kg' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setWeightUnit('kg')}
                      >
                        kg
                      </Button>
                      <Button
                        type="button"
                        variant={weightUnit === 'lbs' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setWeightUnit('lbs')}
                      >
                        lbs
                      </Button>
                    </div>
                    {weightUnit === 'kg' ? (
                      <Input
                        id="weight"
                        type="number"
                        min="20"
                        max="300"
                        step="0.1"
                        value={formData.weight === 0 ? '' : formData.weight}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '') {
                            handleInputChange('weight', 0)
                            setWeightPounds(0)
                          } else {
                            const kg = parseFloat(value)
                            // Only validate if the number is complete and makes sense
                            if (!isNaN(kg)) {
                              if (kg >= 20 && kg <= 300) {
                                handleInputChange('weight', kg)
                                setWeightPounds(kgToPounds(kg))
                              } else if (kg > 300) {
                                handleInputChange('weight', 300)
                                setWeightPounds(kgToPounds(300))
                              } else if (kg > 0 && kg < 20) {
                                // Allow typing but don't force minimum until they finish
                                handleInputChange('weight', kg)
                                setWeightPounds(kgToPounds(kg))
                              } else if (kg <= 0) {
                                // Don't allow negative or zero
                                handleInputChange('weight', 0)
                                setWeightPounds(0)
                              }
                            }
                          }
                        }}
                        onBlur={(e) => {
                          // Enforce minimum when user finishes editing
                          const kg = parseFloat(e.target.value)
                          if (!isNaN(kg) && kg > 0 && kg < 20) {
                            handleInputChange('weight', 20)
                            setWeightPounds(kgToPounds(20))
                          }
                        }}
                        placeholder="Enter weight (20-300 kg)"
                      />
                    ) : (
                      <Input
                        type="number"
                        min="44"
                        max="660"
                        step="0.1"
                        value={weightPounds === 0 ? '' : weightPounds}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '') {
                            setWeightPounds(0)
                            handleInputChange('weight', 0)
                          } else {
                            const pounds = parseFloat(value)
                            // Only validate if the number is complete and makes sense
                            if (!isNaN(pounds)) {
                              if (pounds >= 44 && pounds <= 660) {
                                setWeightPounds(pounds)
                                const kg = poundsToKg(pounds)
                                handleInputChange('weight', kg)
                              } else if (pounds > 660) {
                                setWeightPounds(660)
                                const kg = poundsToKg(660)
                                handleInputChange('weight', kg)
                              } else if (pounds > 0 && pounds < 44) {
                                // Allow typing but don't force minimum until they finish
                                setWeightPounds(pounds)
                                const kg = poundsToKg(pounds)
                                handleInputChange('weight', kg)
                              } else if (pounds <= 0) {
                                // Don't allow negative or zero
                                setWeightPounds(0)
                                handleInputChange('weight', 0)
                              }
                            }
                          }
                        }}
                        onBlur={(e) => {
                          // Enforce minimum when user finishes editing
                          const pounds = parseFloat(e.target.value)
                          if (!isNaN(pounds) && pounds > 0 && pounds < 44) {
                            setWeightPounds(44)
                            const kg = poundsToKg(44)
                            handleInputChange('weight', kg)
                          }
                        }}
                        placeholder="Enter weight (44-660 lbs)"
                      />
                    )}
                  </>
                ) : (
                  <p className="p-2 bg-muted rounded-md">
                    {profile?.weight && profile.weight > 0 ? (
                      <>
                        {profile.weight} kg ({kgToPounds(profile.weight)} lbs)
                      </>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Medical Information
            </CardTitle>
            <CardDescription>
              Your epilepsy diagnosis and medical history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="epilepsy_type">Type of Epilepsy *</Label>
                {isEditing ? (
                  <Input
                    id="epilepsy_type"
                    value={formData.epilepsy_type}
                    onChange={(e) => handleInputChange('epilepsy_type', e.target.value)}
                    placeholder="e.g., Temporal Lobe Epilepsy, Generalized Epilepsy"
                  />
                ) : (
                  <p className="p-2 bg-muted rounded-md">{profile?.epilepsy_type || 'Not provided'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis_length">Length of Diagnosis *</Label>
                {isEditing ? (
                  <Input
                    id="diagnosis_length"
                    value={formData.diagnosis_length}
                    onChange={(e) => handleInputChange('diagnosis_length', e.target.value)}
                    placeholder="e.g., 5 years, Since childhood, 2 months"
                  />
                ) : (
                  <p className="p-2 bg-muted rounded-md">{profile?.diagnosis_length || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical_notes">Additional Medical Notes</Label>
              {isEditing ? (
                <Textarea
                  id="medical_notes"
                  value={formData.medical_notes || ''}
                  onChange={(e) => handleInputChange('medical_notes', e.target.value)}
                  placeholder="Any additional medical information, medications, triggers, etc."
                  rows={3}
                />
              ) : (
                <p className="p-2 bg-muted rounded-md min-h-[60px]">
                  {profile?.medical_notes || 'No additional notes provided'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              App Preferences
            </CardTitle>
            <CardDescription>
              Customize your measurement system and display preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Measurement System</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred measurement system for height, weight, and temperature
                </p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="measurementSystem"
                      value="metric"
                      checked={measurementSystem === 'metric'}
                      onChange={() => handleMeasurementSystemChange('metric')}
                      className="w-4 h-4"
                    />
                    <div className="space-y-1">
                      <div className="font-medium">Metric</div>
                      <div className="text-xs text-muted-foreground">cm, kg, °C</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="measurementSystem"
                      value="imperial"
                      checked={measurementSystem === 'imperial'}
                      onChange={() => handleMeasurementSystemChange('imperial')}
                      className="w-4 h-4"
                    />
                    <div className="space-y-1">
                      <div className="font-medium">Imperial (US)</div>
                      <div className="text-xs text-muted-foreground">ft/in, lbs, °F</div>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-md text-sm">
                <div className="font-medium mb-1">Current Settings:</div>
                <div className="text-muted-foreground">
                  Height: {heightUnit === 'cm' ? 'Centimeters' : 'Feet & Inches'} •{' '}
                  Weight: {weightUnit === 'kg' ? 'Kilograms' : 'Pounds'} •{' '}
                  Temperature: {unit === 'celsius' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Emergency Contact
            </CardTitle>
            <CardDescription>
              Primary emergency contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Emergency Contact Name *</Label>
                {isEditing ? (
                  <Input
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                    placeholder="Enter emergency contact name"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <Users className="w-4 h-4" />
                    {profile?.emergency_contact_name || 'Not provided'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Emergency Contact Phone *</Label>
                {isEditing ? (
                  <Input
                    id="emergency_contact_phone"
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                    placeholder="Enter emergency contact phone"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <Phone className="w-4 h-4" />
                    {profile?.emergency_contact_phone || 'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Healthcare Provider
            </CardTitle>
            <CardDescription>
              Your primary doctor or neurologist information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctor_name">Doctor Name *</Label>
                {isEditing ? (
                  <Input
                    id="doctor_name"
                    value={formData.doctor_name}
                    onChange={(e) => handleInputChange('doctor_name', e.target.value)}
                    placeholder="Enter doctor's name"
                  />
                ) : (
                  <p className="p-2 bg-muted rounded-md">{profile?.doctor_name || 'Not provided'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor_phone">Doctor Phone *</Label>
                {isEditing ? (
                  <Input
                    id="doctor_phone"
                    type="tel"
                    value={formData.doctor_phone}
                    onChange={(e) => handleInputChange('doctor_phone', e.target.value)}
                    placeholder="Enter doctor's phone"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <Phone className="w-4 h-4" />
                    {profile?.doctor_phone || 'Not provided'}
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="doctor_email">Doctor Email (Optional)</Label>
                {isEditing ? (
                  <Input
                    id="doctor_email"
                    type="email"
                    value={formData.doctor_email || ''}
                    onChange={(e) => handleInputChange('doctor_email', e.target.value)}
                    placeholder="Enter doctor's email (optional)"
                  />
                ) : (
                  <p className="p-2 bg-muted rounded-md">
                    {profile?.doctor_email || 'Not provided'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary">
                    {profile.age && profile.age > 0 ? profile.age : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Years Old</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary">
                    {profile.height && profile.height > 0 ? `${profile.height}` : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Height (cm)
                    {profile.height && profile.height > 0 && (
                      <div className="text-xs">
                        {cmToFeetInches(profile.height).feet}'{cmToFeetInches(profile.height).inches}"
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary">
                    {profile.weight && profile.weight > 0 ? `${profile.weight}` : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Weight (kg)
                    {profile.weight && profile.weight > 0 && (
                      <div className="text-xs">
                        {kgToPounds(profile.weight)} lbs
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary">
                    {calculateBMI(profile.height || 0, profile.weight || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    BMI {getBMICategory(calculateBMI(profile.height || 0, profile.weight || 0)) && 
                         `(${getBMICategory(calculateBMI(profile.height || 0, profile.weight || 0))})`}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary">{profile.diagnosis_length || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">Diagnosed</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary">{profile.alert_threshold || 70}%</div>
                  <div className="text-sm text-muted-foreground">Alert Threshold</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
