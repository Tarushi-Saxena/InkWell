-- To populate your blog with futuristic samples, MAKE SURE YOU HAVE CREATED AT LEAST ONE ACCOUNT ON YOUR LOCAL WEBSITE FIRST!
-- Then, run this in your Supabase SQL Editor:

DO $$
DECLARE 
  first_user_id uuid;
BEGIN
  -- Grab the very first user who signed up on the site to assign as the author
  SELECT id INTO first_user_id FROM public.profiles LIMIT 1;

  IF first_user_id IS NULL THEN
     RAISE EXCEPTION 'You must sign up for an account on localhost:3000 first so the posts have an author!';
  END IF;

  INSERT INTO public.posts (title, body, summary, image_url, author_id)
  VALUES 
  ('The Dawn of Artificial General Intelligence', 
   'As we stand on the precipice of a new era, Artificial General Intelligence (AGI) promises to reshape the very fabric of our existence. Unlike narrow AI, which excels at specific tasks, AGI points toward machines that equal or exceed human intelligence across a wide range of cognitive domains. The implications stretch from solving climate change to autonomous scientific discovery.', 
   'Artificial General Intelligence (AGI) represents a monumental leap over narrow AI, possessing human-like cognitive abilities across diverse domains. As AGI research accelerates, it holds the potential to revolutionize fields from healthcare to quantum physics, though it also necessitates rigorous ethical frameworks and alignment protocols.', 
   'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1600',
   first_user_id),

  ('Quantum Computing: Beyond the Qubit', 
   'Quantum computing leverages the mind-bending properties of quantum mechanics—superposition and entanglement—to process information in ways classical computers cannot. While conventional bits are strictly 0 or 1, qubits can exist in multiple states simultaneously, unlocking exponential processing power that will soon break current encryption standards.', 
   'Quantum mechanics enables processing power far beyond classical thresholds through qubits and entanglement. This post explores the timeline for quantum supremacy and how industries are proactively preparing for the incoming paradigm shift in computational speed, cryptography, and molecular modeling.', 
   'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1600',
   first_user_id),

  ('Neural Interfaces and the Meta-Consciousness', 
   'The integration of brain-computer interfaces (BCIs) is transitioning from medical rehabilitation to mainstream augmentation. As companies pilot high-bandwidth neural implants, the horizon of human-to-machine communication expands. We are no longer limited by the speed of our thumbs; thoughts themselves become the ultimate input device.', 
   'Brain-computer interfaces are redefining human limitations by establishing direct neural links to digital environments. As bandwidth caps vanish, cognitive augmentation promises to seamlessly merge human intent with artificial processing power, presenting profound existential and privacy considerations.', 
   'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1600',
   first_user_id);
END $$;
