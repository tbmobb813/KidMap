// utils/speechEngine.ts - Voice navigation engine for KidMap
import * as Speech from 'expo-speech';

export interface VoiceCommand {
  command: string;
  variations: string[];
  action: string;
  response: string;
}

export class SpeechEngine {
  private static instance: SpeechEngine;
  private isInitialized = false;
  private currentLanguage = 'en-US';
  private speechRate = 0.8; // Slower for kids
  private voicePitch = 1.1; // Slightly higher pitch for kids

  static getInstance(): SpeechEngine {
    if (!SpeechEngine.instance) {
      SpeechEngine.instance = new SpeechEngine();
    }
    return SpeechEngine.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if speech is available
      const voices = await Speech.getAvailableVoicesAsync();
      console.log('Available voices:', voices.length);
      this.isInitialized = true;
    } catch (error) {
      console.error('Speech initialization failed:', error);
    }
  }

  // Predefined voice commands for kid-friendly navigation
  private voiceCommands: VoiceCommand[] = [
    {
      command: 'where_am_i',
      variations: ['where am i', 'where are we', 'what is this place', 'where is this'],
      action: 'location_status',
      response: 'You are currently at {location}. Looking good!'
    },
    {
      command: 'repeat_directions',
      variations: ['repeat', 'say again', 'what do i do', 'help me', 'directions'],
      action: 'repeat_instruction',
      response: 'Sure! {instruction}'
    },
    {
      command: 'time_left',
      variations: ['how long', 'time left', 'how much longer', 'when will we arrive'],
      action: 'time_estimate',
      response: 'You have about {time} minutes left. You\'re doing great!'
    },
    {
      command: 'call_help',
      variations: ['help', 'emergency', 'call mom', 'call dad', 'i need help'],
      action: 'emergency_contact',
      response: 'I\'ll help you call someone right away!'
    },
    {
      command: 'next_step',
      variations: ['next', 'what next', 'done', 'finished', 'completed'],
      action: 'advance_step',
      response: 'Great job! Moving to the next step.'
    },
    {
      command: 'slow_down',
      variations: ['slow down', 'speak slower', 'too fast'],
      action: 'adjust_speed',
      response: 'I\'ll speak more slowly for you.'
    },
    {
      command: 'speak_up',
      variations: ['louder', 'speak up', 'can\'t hear', 'volume up'],
      action: 'adjust_volume',
      response: 'I\'ll speak louder now!'
    },
    {
      command: 'pause_navigation',
      variations: ['pause', 'stop', 'take a break', 'wait'],
      action: 'pause_navigation',
      response: 'Navigation paused. Take your time!'
    },
    {
      command: 'resume_navigation',
      variations: ['resume', 'continue', 'go', 'start again'],
      action: 'resume_navigation',
      response: 'Let\'s continue! You\'re doing amazing!'
    },
    {
      command: 'safety_check',
      variations: ['am i safe', 'is this safe', 'safety check'],
      action: 'safety_assessment',
      response: 'You\'re on a safe route! Keep following the directions.'
    }
  ];

  // Convert text to speech with kid-friendly settings
  async speak(text: string, options?: { interrupt?: boolean; language?: string }): Promise<void> {
    const kidFriendlyText = this.makeTextKidFriendly(text);
    
    try {
      if (options?.interrupt) {
        await Speech.stop();
      }

      await Speech.speak(kidFriendlyText, {
        language: options?.language || this.currentLanguage,
        pitch: this.voicePitch,
        rate: this.speechRate,
        volume: 0.8,
      });
    } catch (error) {
      console.error('Speech synthesis failed:', error);
    }
  }

  // Make text more kid-friendly
  private makeTextKidFriendly(text: string): string {
    let friendlyText = text;

    // Replace technical terms with kid-friendly equivalents
    const replacements: Record<string, string> = {
      'northeast': 'toward the sunrise direction',
      'southwest': 'toward the sunset direction',
      'northwest': 'toward the left and up',
      'southeast': 'toward the right and down',
      'proceed': 'walk',
      'continue': 'keep going',
      'destination': 'where you want to go',
      'intersection': 'corner where streets meet',
      'pedestrian': 'walking',
      'crosswalk': 'safe place to cross',
      'traffic light': 'stoplight',
      'approximately': 'about',
      'meters': 'steps',
      'kilometers': 'blocks',
    };

    Object.entries(replacements).forEach(([technical, friendly]) => {
      const regex = new RegExp(technical, 'gi');
      friendlyText = friendlyText.replace(regex, friendly);
    });

    // Add encouragement
    if (friendlyText.includes('turn') || friendlyText.includes('walk')) {
      const encouragements = [
        'You\'re doing great! ',
        'Nice job! ',
        'Keep it up! ',
        'Awesome! ',
        'Perfect! '
      ];
      const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
      friendlyText = randomEncouragement + friendlyText;
    }

    return friendlyText;
  }

  // Process voice input and return matched command
  processVoiceInput(input: string): VoiceCommand | null {
    const normalizedInput = input.toLowerCase().trim();
    
    for (const command of this.voiceCommands) {
      for (const variation of command.variations) {
        if (normalizedInput.includes(variation) || this.fuzzyMatch(normalizedInput, variation)) {
          return command;
        }
      }
    }
    
    return null;
  }

  // Simple fuzzy matching for voice recognition errors
  private fuzzyMatch(input: string, target: string, threshold = 0.7): boolean {
    const inputWords = input.split(' ');
    const targetWords = target.split(' ');
    
    let matches = 0;
    for (const inputWord of inputWords) {
      for (const targetWord of targetWords) {
        if (inputWord === targetWord || this.levenshteinDistance(inputWord, targetWord) <= 2) {
          matches++;
          break;
        }
      }
    }
    
    return matches / Math.max(inputWords.length, targetWords.length) >= threshold;
  }

  // Calculate edit distance for fuzzy matching
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // insertion
          matrix[j - 1][i] + 1, // deletion
          matrix[j - 1][i - 1] + substitutionCost // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Generate contextual responses
  generateResponse(commandAction: string, context: any): string {
    const responses: Record<string, string[]> = {
      location_status: [
        'You\'re at {location}! Everything looks good.',
        'This is {location}. You\'re right where you should be!',
        'Perfect! You\'re at {location}. Keep up the great work!'
      ],
      repeat_instruction: [
        'Sure thing! {instruction}',
        'No problem! {instruction}',
        'Here it is again: {instruction}'
      ],
      time_estimate: [
        'You have about {time} minutes left. You\'re doing amazing!',
        'Just {time} more minutes! You\'ve got this!',
        'Almost there! About {time} minutes to go!'
      ],
      emergency_contact: [
        'I\'ll help you call someone right now!',
        'Let\'s get you help immediately!',
        'Calling for help right away!'
      ],
      advance_step: [
        'Excellent work! Let\'s move to the next step.',
        'You did it! Ready for what\'s next?',
        'Great job! Here\'s your next direction.'
      ]
    };

    const responseOptions = responses[commandAction] || ['I understand! Let me help you.'];
    const randomResponse = responseOptions[Math.floor(Math.random() * responseOptions.length)];
    
    // Replace placeholders with context data
    let finalResponse = randomResponse;
    if (context.location) finalResponse = finalResponse.replace('{location}', context.location);
    if (context.instruction) finalResponse = finalResponse.replace('{instruction}', context.instruction);
    if (context.time) finalResponse = finalResponse.replace('{time}', context.time.toString());
    
    return finalResponse;
  }

  // Speak navigation instruction with context
  async speakInstruction(instruction: string, context?: any): Promise<void> {
    let enhancedInstruction = instruction;
    
    // Add context if available
    if (context?.distance) {
      enhancedInstruction = `In about ${context.distance} steps, ${instruction}`;
    }
    
    if (context?.landmark) {
      enhancedInstruction += ` Look for ${context.landmark}`;
    }
    
    if (context?.safety) {
      enhancedInstruction += ' Stay on the sidewalk and be aware of your surroundings.';
    }
    
    await this.speak(enhancedInstruction);
  }

  // Adjust speech settings based on user preferences
  adjustSpeechSettings(settings: { rate?: number; pitch?: number; language?: string }): void {
    if (settings.rate) this.speechRate = Math.max(0.3, Math.min(1.0, settings.rate));
    if (settings.pitch) this.voicePitch = Math.max(0.5, Math.min(1.5, settings.pitch));
    if (settings.language) this.currentLanguage = settings.language;
  }

  // Stop current speech
  async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop();
    } catch (error) {
      console.error('Failed to stop speech:', error);
    }
  }

  // Check if speech is currently active
  async isSpeaking(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch (error) {
      console.error('Failed to check speech status:', error);
      return false;
    }
  }

  // Get available commands for help
  getAvailableCommands(): string[] {
    return this.voiceCommands.map(cmd => cmd.variations[0]);
  }

  // Speak welcome message when navigation starts
  async speakWelcome(destination: string): Promise<void> {
    const welcomeMessages = [
      `Hi there! I'm your voice guide to ${destination}. I'll help you get there safely!`,
      `Great choice! Let's go to ${destination} together. I'll be with you every step!`,
      `Ready for an adventure to ${destination}? I'll make sure you get there safely!`
    ];
    
    const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    await this.speak(randomWelcome);
  }

  // Speak completion celebration
  async speakCompletion(destination: string, duration: number): Promise<void> {
    const completionMessages = [
      `Congratulations! You made it to ${destination} in ${duration} minutes! You did an amazing job!`,
      `Fantastic! Welcome to ${destination}! That took ${duration} minutes and you were perfect!`,
      `You did it! ${destination} reached in ${duration} minutes! I'm so proud of you!`
    ];
    
    const randomCompletion = completionMessages[Math.floor(Math.random() * completionMessages.length)];
    await this.speak(randomCompletion);
  }
}

// Export singleton instance
export const speechEngine = SpeechEngine.getInstance();
