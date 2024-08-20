import { type ClientSchema, a, defineData, defineFunction } from "@aws-amplify/backend";

export const thermometer = defineFunction({
  name: 'thermometer',
  entry: './thermometer.ts',
});

const todo = {
  content: a.string(),
  isDone: a.boolean().required()
};

const schema = a.schema({
  // Custom type and query to be used as a tool definition in the conversation route.
  Temperature: a.customType({
    value: a.integer(),
    unit: a.string(),
  }),
  thermometer: a.query()
    .arguments({ city: a.string() })
    .returns(a.ref('Temperature'))
    .handler(a.handler.function(thermometer))
    .authorization((allow) => allow.authenticated()),

  // Conversation route with a tool definition.
  pirateChat: a.conversation({
    aiModel: a.aiModel.anthropic.claude3Haiku(),
    systemPrompt: 'You are a helpful chatbot that responds in the voice and tone of a pirate. Respond in 20 words or less.',
    tools: [
      {
        query: a.ref('thermometer'),
        description: 'Provides the current temperature for a given city.'
      },
    ],
  }),

  // Custom types for generating nested objects.
  Nested: a.customType({
    bar: a.string().required(),
  }),

  Nest: a.customType({
    foo: a.string().required(),
    nested: a.ref('Nested').required(),
  }),

  generateNest: a.generation({
    aiModel: a.aiModel.anthropic.claude3Haiku(),
    systemPrompt: 'Generate the object with the foo and nested properties.',
  })
    .arguments({ description: a.string() })
    .returns(a.ref('Nest'))
    .authorization((allow) => allow.publicApiKey()),

  // Model for a Todo database table.
  Todo: a.model(todo)
    .authorization((allow) => allow.authenticated()),

  TodoType: a.customType(todo),
  // Generation route for generating a list of todos based on a description.
  generateTodos: a.generation({
    aiModel: a.aiModel.anthropic.claude3Haiku(),
    systemPrompt: 'You are a helpful assistant that generates a list of todos based on the description.',
  })
    .arguments({ description: a.string() })
    .returns(a.ref('TodoType').array())
    .authorization((allow) => allow.publicApiKey()),

  // Generation route for generating a recipe based on a description.
  generateRecipe: a.generation({
    aiModel: a.aiModel.anthropic.claude3Haiku(),
    systemPrompt: 'You are a helpful assistant that generates recipes.',
  })
    .arguments({ description: a.string() })
    .returns(
      a.customType({
        name: a.string(),
        ingredients: a.string().array(),
        instructions: a.string(),
      })
    )
    .authorization((allow) => allow.authenticated())
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: { expiresInDays: 7 },
  },
});
