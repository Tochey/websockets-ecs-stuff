import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const cluster = new ecs.Cluster(this, 'ws-cluster', {
      clusterName: 'ws-cluster',
    })

    const securityGroup = new ec2.SecurityGroup(this, 'ws-security-group', {
      vpc: cluster.vpc,
      allowAllOutbound: true,
    });

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.allTraffic());

    const td = new ecs.FargateTaskDefinition(this, 'ws-taskdef', {
      memoryLimitMiB: 512,
      cpu: 256,
    })

    const container = td.addContainer('ws-container', {
      image: ecs.ContainerImage.fromAsset('../'),
      memoryLimitMiB: 512,
      cpu: 256,
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'ws-container',
      }),
    })

    container.addPortMappings({
      containerPort: 8085,
      protocol: ecs.Protocol.TCP,
    })

    const svc = new ecs.FargateService(this, 'ws-svc', {
      cluster,
      taskDefinition: td,
      desiredCount: 1,
      serviceName: 'ws-svc',
      assignPublicIp: true,
      securityGroups: [securityGroup],
    })

    const lb = new elbv2.ApplicationLoadBalancer(this, 'ws-lb', {
      vpc: cluster.vpc,
      internetFacing: true,
    });

    const listener = lb.addListener('ws-listener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
    });

    listener.addTargets('ws-target', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [svc],
    });

    const hostedZone = route53.HostedZone.fromLookup(this, 'univibe-hosted-zone', {
      domainName: 'joinunivibe.com', 
    });

    new route53.ARecord(this, 'ws-dns-record', {
      zone: hostedZone,
      recordName: 'api.joinunivibe.com', 
      target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(lb)),});

    new cdk.CfnOutput(this, 'ws-lb-dns', {
      value: lb.loadBalancerDnsName,
      description: 'DNS name of the load balancer',
    });
  }
 }

