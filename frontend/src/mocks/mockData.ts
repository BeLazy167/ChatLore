import { faker } from "@faker-js/faker";

// Security Insights Mock Data
export const mockSecurityInsights = {
    metrics: {
        securityScore: 78,
        totalFindings: 12,
        criticalCount: 2,
        highCount: 3,
        mediumCount: 4,
        lowCount: 3,
        sensitiveDataCount: 45,
    },
    insights: [
        {
            title: "Exposed Personal Information",
            description:
                "Multiple instances of personal information sharing detected in chat messages",
            severity: "critical",
            impact: "High risk of identity theft and privacy breaches due to exposed personal data",
            recommendations: [
                "Review and remove messages containing personal information",
                "Establish guidelines for sharing sensitive data",
                "Use secure channels for personal information exchange",
            ],
            examples: [
                "Phone number shared in group chat: +1 (555) 123-4567",
                "Email address exposed: user@example.com",
            ],
        },
        {
            title: "Unsecured Link Sharing",
            description:
                "Several instances of sharing unverified and potentially malicious links",
            severity: "high",
            impact: "Potential exposure to phishing attacks and malware distribution",
            recommendations: [
                "Verify links before sharing",
                "Use link preview features",
                "Avoid clicking on suspicious links",
            ],
            examples: [
                "Suspicious shortened link: bit.ly/suspicious-link",
                "Unknown domain link: freeprize.example.suspicious.com",
            ],
        },
        {
            title: "Location Data Exposure",
            description: "Frequent sharing of precise location information",
            severity: "medium",
            impact: "Privacy risks related to physical location tracking",
            recommendations: [
                "Disable location sharing when not needed",
                "Use general location descriptions instead of precise coordinates",
                "Review location sharing settings",
            ],
            examples: [
                "Live location shared for extended period",
                "Precise address shared in public group",
            ],
        },
    ],
    sensitiveData: {
        "Phone Numbers": {
            count: 15,
            examples: [
                "+1 (555) 123-4567",
                "+1 (555) 987-6543",
                "+1 (555) 456-7890",
            ],
            riskLevel: "high",
        },
        "Email Addresses": {
            count: 12,
            examples: [
                "user@example.com",
                "private@domain.com",
                "personal@email.com",
            ],
            riskLevel: "medium",
        },
        Locations: {
            count: 8,
            examples: [
                "123 Main Street, Anytown, USA",
                "Central Park, New York",
                "Local Coffee Shop, Downtown",
            ],
            riskLevel: "medium",
        },
        "Payment Info": {
            count: 5,
            examples: [
                "Venmo username shared",
                "PayPal email exposed",
                "Bank transfer details discussed",
            ],
            riskLevel: "high",
        },
        Dates: {
            count: 25,
            examples: [
                "Birthday mentioned",
                "Anniversary date shared",
                "Travel dates discussed",
            ],
            riskLevel: "low",
        },
    },
    trends: [
        {
            category: "Personal Info",
            count: 15,
            change: 25,
            period: "last 30 days",
        },
        {
            category: "Location Data",
            count: 8,
            change: -10,
            period: "last 30 days",
        },
        {
            category: "Payment Info",
            count: 5,
            change: 50,
            period: "last 30 days",
        },
        {
            category: "Links",
            count: 20,
            change: 15,
            period: "last 30 days",
        },
    ],
    recommendations: [
        {
            title: "Enable End-to-End Encryption",
            description:
                "Ensure all sensitive conversations are protected with encryption",
            impact: "Prevents unauthorized access to chat content",
            priority: "high",
            steps: [
                "Verify encryption is enabled for all chats",
                "Use secure messaging features for sensitive information",
                "Regularly check security settings",
            ],
        },
        {
            title: "Implement Data Sharing Guidelines",
            description:
                "Create and follow guidelines for sharing sensitive information",
            impact: "Reduces risk of accidental data exposure",
            priority: "high",
            steps: [
                "Define what constitutes sensitive information",
                "Establish protocols for necessary data sharing",
                "Train team members on guidelines",
            ],
        },
        {
            title: "Regular Security Audits",
            description: "Perform periodic reviews of chat security",
            impact: "Maintains ongoing security awareness",
            priority: "medium",
            steps: [
                "Schedule monthly security reviews",
                "Document and address findings",
                "Update security measures as needed",
            ],
        },
    ],
};

// Search Results Mock Data
export const generateMockSearchResults = (query: string) => ({
    results: Array.from({ length: 5 }, () => ({
        id: faker.string.uuid(),
        content: faker.lorem.paragraph(),
        sender: faker.person.fullName(),
        timestamp: faker.date.recent().toISOString(),
        relevanceScore: faker.number.float({
            min: 0.5,
            max: 1,
        }),
        aiExplanation: `This message is relevant because it ${faker.lorem
            .sentence()
            .toLowerCase()}`,
        context: {
            before: Array.from({ length: 2 }, () => faker.lorem.sentence()),
            after: Array.from({ length: 2 }, () => faker.lorem.sentence()),
        },
    })),
    totalResults: 15,
    searchContext: {
        query,
        filters: {},
        aiEnhancements: [
            "Semantic matching applied",
            "Context analysis enabled",
            "Entity recognition active",
        ],
    },
});

// Context Analysis Mock Data
export const generateMockContextAnalysis = () => ({
    summary: faker.lorem.paragraph(),
    topics: Array.from({ length: 4 }, () => faker.lorem.word()),
    sentiment: faker.helpers.arrayElement(["positive", "negative", "neutral"]),
    entities: Array.from({ length: 3 }, () => ({
        name: faker.person.fullName(),
        type: faker.helpers.arrayElement([
            "person",
            "organization",
            "location",
        ]),
        mentions: faker.number.int({ min: 1, max: 10 }),
    })),
    keyInsights: Array.from({ length: 3 }, () => faker.lorem.sentence()),
});

// Gemini Insights Mock Data
export const generateMockGeminiInsights = () => ({
    summary: faker.lorem.paragraph(),
    insights: Array.from({ length: 3 }, () => faker.lorem.sentence()),
    recommendations: Array.from({ length: 3 }, () => faker.lorem.sentence()),
});
