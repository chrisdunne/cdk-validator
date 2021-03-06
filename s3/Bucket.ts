import { Annotations, IAspect, IConstruct, Tokenization } from "@aws-cdk/core";
import { CfnBucket } from '@aws-cdk/aws-s3'
import IBucket from "./IBucket";

export default class Bucket implements IBucket, IAspect {
    isVersioned: boolean | undefined = true
    isEncrypted: boolean | undefined = true
    isPublic: boolean | undefined = false

    constructor(isPublic?: boolean, isEncrypted?: boolean, isVersioned?: boolean) {
        this.isPublic = isPublic
        this.isEncrypted = isEncrypted
        this.isVersioned = isVersioned
    }

    visit(node: IConstruct): void {
        if (!(node instanceof CfnBucket)) return

        if (this.isVersioned && (!node.versioningConfiguration 
            || (!Tokenization.isResolvable(node.versioningConfiguration)
                && node.versioningConfiguration.status !== 'Enabled'))) {
            this.addError(node, 'Bucket versioning is not enabled');
          }
        
        if (this.isEncrypted && !node.bucketEncryption) {
            this.addError(node, 'Bucket encryption is not enabled')
        }

        if (this.isPublic && !node.publicAccessBlockConfiguration) {
            this.addError(node, 'Bucket is publicly accessible')
        }
    }

    private addError(node: IConstruct, message: string) {
        Annotations.of(node).addError(message);
    }
}