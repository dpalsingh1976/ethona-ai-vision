

## Create Real Estate Chatbot Demo Page and Category

### Overview
Create a new page to embed the Voiceflow chatbot widget for real estate agents, then add a "Real Estate" category section to the Demo page that links to it.

---

### Files to Create/Modify

#### 1. Create New Page: `src/pages/demos/RealEstateChatbot.tsx`

**Purpose:** A dedicated page showcasing the Real Estate AI chatbot demo with the embedded Voiceflow widget.

**Structure:**
- Navbar and Footer components
- Hero section with Real Estate theme (sky/blue colors to match AI Agents page)
- Brief description of the chatbot capabilities
- The Voiceflow widget will be loaded via useEffect hook
- Back link to the Demo page

**Voiceflow Widget Integration:**
```typescript
useEffect(() => {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://cdn.voiceflow.com/widget-next/bundle.mjs';
  script.onload = () => {
    (window as any).voiceflow.chat.load({
      verify: { projectID: '69781dc4b4cc533b496ecccf' },
      url: 'https://general-runtime.voiceflow.com',
      versionID: 'production',
      voice: {
        url: "https://runtime-api.voiceflow.com"
      }
    });
  };
  document.body.appendChild(script);
  
  return () => {
    // Cleanup on unmount
    document.body.removeChild(script);
  };
}, []);
```

---

#### 2. Modify: `src/pages/Demo.tsx`

**Add Real Estate Category Section:**

Add imports:
- `Building2` icon from lucide-react
- `Link` from react-router-dom
- `Bot` icon for chatbot indicator

Restructure the page to include:
- Existing "Web Development" demos (current demos array)
- New "Real Estate" category with AI chatbot demo card

**Updated Structure:**
```typescript
// Add category-based organization
const webDemos = [...]; // existing demos

const realEstateDemos = [
  {
    name: "Real Estate AI Chatbot",
    description: "Interactive AI-powered chatbot designed for real estate agents. Handles property inquiries, scheduling, and client engagement.",
    path: "/demo/real-estate-chatbot",
    gradient: "from-sky-50 to-blue-50",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    isInternal: true,
  },
];
```

**Visual Changes:**
- Add category headers ("Web Development Demos", "Real Estate AI Demos")
- Real Estate section uses sky/blue theme consistent with AI Agents page
- Internal links use `<Link>` component instead of external `<a>` tags

---

#### 3. Modify: `src/App.tsx`

Add route for the new chatbot demo page:
```typescript
import RealEstateChatbot from "./pages/demos/RealEstateChatbot";

// Add route:
<Route path="/demo/real-estate-chatbot" element={<RealEstateChatbot />} />
```

---

### File Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/demos/RealEstateChatbot.tsx` | **Create** | New page with Voiceflow chatbot widget |
| `src/pages/Demo.tsx` | **Modify** | Add Real Estate category section |
| `src/App.tsx` | **Modify** | Add route for chatbot demo page |

---

### Technical Notes

- The Voiceflow widget script is loaded dynamically in useEffect with proper cleanup
- TypeScript window type is extended to handle the voiceflow global object
- The chatbot will appear as a floating widget on the demo page
- Real Estate theme colors (sky/blue) match the AI Agents page for consistency

