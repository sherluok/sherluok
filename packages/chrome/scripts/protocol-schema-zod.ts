// import { z } from 'zod';

// const Version = z.object({
//   major: z.string(),
//   minor: z.string(),
// });

// const Domain = z.object({
//   domain: z.string().describe('Name of domain'),
//   description: z.string().optional().describe('Description of the domain'),
//   dependencies: z.string().array().optional().describe('Dependencies on other domains'),
//   types: z.lazy(() => DomainType).array().optional().describe('Types used by the domain.'),
//   commands: z.lazy(() => Command).array().optional().describe('Commands accepted by the domain'),
//   events: z.lazy(() => Event).array().optional().describe('Events fired by domain'),
// });

// const Event = z.object({
//   name: z.string(),
//   parameters: z.lazy(() => PropertyType).array().optional(),
//   description: z.string().optional().describe('Description of the event'),
// });

// const Command = Event.extend({
//   returns: z.lazy(() => PropertyType).array().optional(),
//   async: z.boolean().optional(),
//   redirect: z.string().optional(),
// });

// const ArrayType = z.object({
//   type: z.literal('array'),
//   items: z.union([
//     z.lazy(() => RefType),
//     z.lazy(() => PrimitiveType),
//     z.lazy(() => StringType),
//     z.lazy(() => AnyType),
//     z.lazy(() => ObjectType),
//   ]).describe('Maps to a typed array e.g string[]'),
//   minItems: z.number().optional().describe('Cardinality of length of array type'),
//   maxItems: z.number().optional(),
// });

// const ObjectType = z.object({
//   type: z.literal('object'),
//   get properties(): z.ZodOptional<z.ZodArray<z.ZodIntersection<typeof PropertyBaseType, z.ZodUnion<[typeof StringType, typeof ObjectType, typeof ArrayType, typeof PrimitiveType, typeof RefType, typeof AnyType]>>>> {
//     return PropertyType.array().optional().describe('Properties of the type. Maps to a typed object');
//   },
// });

// const StringType = z.object({
//   type: z.literal('string'),
//   enum: z.string().array().optional().describe('Possible values of a string.')
// });

// const PrimitiveType = z.object({
//   type: z.union([z.literal('number'), z.literal('integer'), z.literal('boolean')]),
// });

// const AnyType = z.object({
//   type: z.literal('any'),
// });

// const RefType = z.object({
//   $ref: z.string().describe('Reference to a domain defined type'),
// });

// const PropertyBaseType = z.object({
//   name: z.string().describe('Name of param'),
//   optional: z.boolean().optional().describe('Is the property optional ?'),
//   description: z.string().optional().describe('Description of the type'),
// });

// const DomainType = z.intersection(z.object({
//   id: z.string().describe('Name of property'),
//   description: z.string().optional().describe('Description of the type'),
// }), z.union([StringType, ObjectType, ArrayType, PrimitiveType]));

// const ProtocolType = z.union([StringType, ObjectType, ArrayType, PrimitiveType, RefType, AnyType]);

// const PropertyType = z.intersection(PropertyBaseType, ProtocolType);

// export const IProtocol = z.object({
//   version: Version,
//   domains: Domain.array(),
// });

// export type IProtocol = z.infer<typeof IProtocol>;

// export namespace Protocol {
//   export type Version = z.infer<typeof Version>;
//   export type Domain = z.infer<typeof Domain>;
//   export type Command = z.infer<typeof Command>;
//   export type Event = z.infer<typeof Event>;
//   export type ArrayType = z.infer<typeof ArrayType>;
//   export type ObjectType = z.infer<typeof ObjectType>;
//   export type StringType = z.infer<typeof StringType>;
//   export type PrimitiveType = z.infer<typeof PrimitiveType>;
//   export type AnyType = z.infer<typeof AnyType>;
//   export type RefType = z.infer<typeof RefType>;
//   export type PropertyBaseType = z.infer<typeof PropertyBaseType>;
// }
