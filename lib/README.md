# Utility Libraries

This directory contains shared utility functions that are used across the application. By centralizing these functions, we ensure consistency, reduce code duplication, and make maintenance easier.

## Available Utilities

### `formUtils.ts`

Provides utilities for handling form inputs and changes.

```typescript
// Handle regular input changes
import { handleInputChange } from '@/lib/formUtils';

// In your component:
const handleFormInputChange = (e) => {
  handleInputChange(e, setFormData, formData);
};

// Handle array input changes (comma-separated values)
import { handleArrayInputChange } from '@/lib/formUtils';

// Handle slider input changes
import { handleSliderChange } from '@/lib/formUtils';

// Handle simple string input changes
import { handleStringChange } from '@/lib/formUtils';

// Example usage for simple string input:
<input 
  value={name}
  onChange={(e) => handleStringChange(e, setName)}
/>
```

### `dataUtils.ts`

Provides utilities for data operations with Supabase.

```typescript
import { 
  fetchProjects, 
  fetchScenarios, 
  createProject,
  createScenario,
  updateScenario,
  getUserCompanyId
} from '@/lib/dataUtils';

// Example: Fetch projects
const getProjects = async () => {
  const { data, error } = await fetchProjects();
  if (error) {
    // Handle error
  }
  // Use data
};

// Example: Create a project
const createNewProject = async (projectData) => {
  const { data, error } = await createProject(projectData);
  // Handle result
};
```

### `authUtils.ts`

Provides utilities for authentication operations.

```typescript
import { 
  getCurrentSession, 
  signInWithEmail,
  signOut, 
  checkAuth 
} from '@/lib/authUtils';

// Example: Sign in
const login = async (email, password) => {
  const { user, session, error } = await signInWithEmail(email, password);
  // Handle result
};

// Example: Check authentication and redirect if needed
const checkAuthentication = async () => {
  const { authenticated, userId } = await checkAuth(() => router.push('/login'));
  if (authenticated) {
    // User is authenticated, proceed
  }
};
```

### `types.ts`

Contains shared TypeScript interfaces and types.

```typescript
import { Project, Scenario, User, FormData } from '@/lib/types';

// Now you can use these types in your components
const [projects, setProjects] = useState<Project[]>([]);
```

## Best Practices

1. Always import and use these utilities instead of creating duplicate functionality
2. If you need to add new functionality, consider adding it to the appropriate utility file
3. Keep utility functions pure and focused on a single responsibility
4. Document any new utilities you add with JSDoc comments 