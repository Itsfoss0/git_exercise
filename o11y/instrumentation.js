const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { NodeTracerProvider } = require("@opentelemetry/sdk-node");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const {
  WinstonInstrumentation,
} = require("@opentelemetry/instrumentation-winston");

const exporter = new JaegerExporter({
  endpoint: "http://localhost:14268/api/traces",
});

const provider = new NodeTracerProvider({
  resource: new Resource({
    "service.name": "bloglist",
  }),
});

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register();

const instrumentations = getNodeAutoInstrumentations();
instrumentations.push(new WinstonInstrumentation());
instrumentations.forEach((inst) => inst.enable());
